'use strict';

(function (root) {
    const api = {};
    const DATE_RE = /^(\d+)-(\d{1,2})-(\d{1,2})$/;
    const HEADER = ['Date', 'Ethiopian Date', 'Season', 'Title', 'Details', 'Status'];

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function dateKey(d) {
        return `${d.ey}-${String(d.em).padStart(2, '0')}-${String(d.ed).padStart(2, '0')}`;
    }

    function parseDate(value) {
        const text = String(value || '').trim();
        const m = text.match(DATE_RE);
        if (!m) throw new Error(`Invalid Ethiopian date: ${text}`);
        const d = { ey: Number(m[1]), em: Number(m[2]), ed: Number(m[3]) };
        if (!Number.isInteger(d.ey) || d.em < 1 || d.em > 13 || d.ed < 1 || d.ed > 30) throw new Error(`Invalid Ethiopian date: ${text}`);
        if (typeof root.getMonthLength === 'function' && d.ed > root.getMonthLength(d.ey, d.em)) throw new Error(`Invalid Ethiopian date: ${text}`);
        return d;
    }

    function csvEscape(value) {
        const text = value == null ? '' : String(value);
        return /[",\n\r\t]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    }

    function parseDelimited(text, delimiter) {
        const rows = [];
        let row = [], cell = '', quoted = false;
        for (let i = 0; i < text.length; i += 1) {
            const ch = text[i];
            if (quoted) {
                if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
                else if (ch === '"') quoted = false;
                else cell += ch;
            } else if (ch === '"') quoted = true;
            else if (ch === delimiter) { row.push(cell); cell = ''; }
            else if (ch === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
            else cell += ch;
        }
        if (quoted) throw new Error('Invalid delimited file: unterminated quoted field.');
        if (cell.length || row.length) { row.push(cell.replace(/\r$/, '')); rows.push(row); }
        return rows.filter(r => r.some(v => String(v).trim() !== ''));
    }

    function rowFromPlan(row) {
        return [dateKey(row.date), `${row.date.ey}-${row.date.em}-${row.date.ed}`, row.season && (row.season.climatic || row.season.fasting || row.season.liturgical || row.season.greatLentWeek) || '', row.title || '', row.details || '', row.status || ''];
    }

    api.createBlankForm = function (plan) {
        const blank = clone(plan);
        blank.name = `${plan.name || 'Planning form'} — Blank form`;
        blank.rows = (plan.rows || []).map(row => ({ ...row, title: '', details: '', status: '' }));
        return blank;
    };

    api.exportForm = function (plan, format, blank) {
        const target = blank ? api.createBlankForm(plan) : clone(plan);
        const rows = target.rows || [];
        const kind = String(format || 'csv').toLowerCase();
        if (kind === 'json') return JSON.stringify(target, null, 2);
        if (kind === 'csv' || kind === 'tsv') {
            const delimiter = kind === 'tsv' ? '\t' : ',';
            return [HEADER, ...rows.map(rowFromPlan)].map(row => row.map(csvEscape).join(delimiter)).join('\n');
        }
        if (kind === 'md') {
            return `# ${target.name || 'Planning'}\n\n| Date | Ethiopian Date | Season | Title | Details | Status |\n|---|---|---|---|---|---|\n${rows.map(r => rowFromPlan(r).map(v => String(v).replace(/\|/g, '\\|')).join(' | ')).map(s => `| ${s} |`).join('\n')}`;
        }
        if (kind === 'html') {
            const esc = v => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            return `<!doctype html><html lang="en"><meta charset="utf-8"><title>${esc(target.name || 'Planning')}</title><table><thead><tr>${HEADER.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${rowFromPlan(r).map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></html>`;
        }
        throw new Error(`Unsupported planning export format: ${format}`);
    };

    function applyRows(plan, rows) {
        const byDate = new Map((plan.rows || []).map(row => [dateKey(row.date), row]));
        for (const values of rows) {
            const date = parseDate(values[0] || values[1]);
            const row = byDate.get(dateKey(date));
            if (!row) throw new Error(`Imported date is not present in the generated schedule: ${dateKey(date)}`);
            row.title = values[3] || '';
            row.details = values[4] || '';
            row.status = values[5] || '';
        }
        return plan;
    }

    api.importText = function (text, format, basePlan) {
        const kind = String(format || 'csv').toLowerCase();
        if (kind === 'json') {
            const parsed = JSON.parse(text);
            if (!parsed || !Array.isArray(parsed.rows) || !parsed.start) throw new Error('Invalid planning JSON.');
            parsed.rows.forEach(row => { row.date = parseDate(row.date || row.ethiopianDate); });
            return parsed;
        }
        if (!basePlan) throw new Error('A generated base plan is required for CSV/TSV import.');
        const delimiter = kind === 'tsv' ? '\t' : ',';
        if (kind !== 'csv' && kind !== 'tsv') throw new Error(`Unsupported planning import format: ${format}`);
        const rows = parseDelimited(text, delimiter);
        if (!rows.length) throw new Error('Planning file is empty.');
        const header = rows.shift().map(v => String(v).trim().toLowerCase());
        if (header[0] !== 'date' || header[1] !== 'ethiopian date') throw new Error('Planning file has an incompatible header.');
        return applyRows(clone(basePlan), rows);
    };

    api.download = function (text, filename, mime) {
        const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 0);
    };

    root.EthioPlanningFileIO = api;
})(typeof window !== 'undefined' ? window : globalThis);
