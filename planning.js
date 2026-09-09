/* Ethiopian Calendar Planning feature
 * Uses the calendar conversion functions already provided by app.js.
 * Exposes a small pure API for schedule generation and export.
 */
(function (global) {
    'use strict';

    const STORAGE_KEY = 'ethio-calendar-plans-v1';

    function assertPositiveInteger(value, name) {
        const n = Number(value);
        if (!Number.isInteger(n) || n <= 0) throw new Error(`${name} must be a positive integer.`);
        return n;
    }

    function toJdn(date) {
        if (!date || !Number.isInteger(date.ey) || !Number.isInteger(date.em) || !Number.isInteger(date.ed)) {
            throw new Error('Invalid Ethiopian date.');
        }
        return global.ethiopianToJdn(date.ey, date.em, date.ed);
    }

    function fromJdn(jdn) {
        const e = global.jdnToEthiopian(jdn);
        return { ey: e.ey, em: e.em, ed: e.ed };
    }

    function addEthiopianMonths(date, months) {
        let total = (date.ey * 13) + (date.em - 1) + months;
        const ey = Math.floor(total / 13);
        const em = ((total % 13) + 13) % 13 + 1;
        const max = global.getMonthLength(ey, em);
        return { ey, em, ed: Math.min(date.ed, max) };
    }

    function addEthiopianYears(date, years) {
        const ey = date.ey + years;
        const max = global.getMonthLength(ey, date.em);
        return { ey, em: date.em, ed: Math.min(date.ed, max) };
    }

    function addUnit(date, value, unit) {
        value = assertPositiveInteger(value, 'Interval');
        switch (unit) {
            case 'day': return fromJdn(toJdn(date) + value);
            case 'week': return fromJdn(toJdn(date) + value * 7);
            case 'month': return addEthiopianMonths(date, value);
            case 'year': return addEthiopianYears(date, value);
            default: throw new Error(`Unsupported interval unit: ${unit}`);
        }
    }

    function compare(a, b) { return toJdn(a) - toJdn(b); }

    function calculateEndDate(start, periodValue, periodUnit) {
        return addUnit(start, assertPositiveInteger(periodValue, 'Period'), periodUnit);
    }

    function generateSchedule(options) {
        const start = { ey: Number(options.start.ey), em: Number(options.start.em), ed: Number(options.start.ed) };
        const periodValue = assertPositiveInteger(options.periodValue, 'Period');
        const intervalValue = assertPositiveInteger(options.intervalValue, 'Interval');
        const periodUnit = options.periodUnit || 'month';
        const intervalUnit = options.intervalUnit || 'day';
        const endExclusive = calculateEndDate(start, periodValue, periodUnit);
        const endJdn = toJdn(endExclusive);
        const rows = [];
        let current = start;
        let guard = 0;

        while (toJdn(current) < endJdn && guard++ < 100000) {
            rows.push({
                id: `${current.ey}-${current.em}-${current.ed}`,
                date: { ...current },
                title: '',
                details: '',
                status: 'planned'
            });
            const next = addUnit(current, intervalValue, intervalUnit);
            if (compare(next, current) <= 0) throw new Error('The interval did not advance the schedule.');
            current = next;
        }
        return { start, endExclusive, periodValue, periodUnit, intervalValue, intervalUnit, rows };
    }

    function loadPlans() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
        catch (_) { return []; }
    }

    function savePlan(plan) {
        const plans = loadPlans();
        const index = plans.findIndex(p => p.id === plan.id);
        if (index >= 0) plans[index] = plan; else plans.push(plan);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
        return plan;
    }

    function deletePlan(id) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loadPlans().filter(p => p.id !== id)));
    }

    function csvEscape(value) {
        const s = String(value ?? '');
        return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }

    function dateLabel(date) { return `${date.ey}-${String(date.em).padStart(2, '0')}-${String(date.ed).padStart(2, '0')}`; }

    function exportText(plan, format) {
        const rows = plan.rows || [];
        if (format === 'json') return JSON.stringify(plan, null, 2);
        if (format === 'csv') {
            return ['Ethiopian Date,Title,Details,Status', ...rows.map(r => [dateLabel(r.date), r.title, r.details, r.status].map(csvEscape).join(','))].join('\n');
        }
        if (format === 'tsv') {
            return ['Ethiopian Date\tTitle\tDetails\tStatus', ...rows.map(r => [dateLabel(r.date), r.title, r.details, r.status].map(v => String(v ?? '').replace(/[\t\r\n]/g, ' ')).join('\t'))].join('\n');
        }
        if (format === 'md') {
            return ['| Ethiopian Date | Title | Details | Status |', '|---|---|---|---|', ...rows.map(r => `| ${dateLabel(r.date)} | ${(r.title || '').replace(/\|/g, '\\|')} | ${(r.details || '').replace(/\|/g, '\\|')} | ${r.status} |`)].join('\n');
        }
        if (format === 'html') {
            const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
            return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(plan.name || 'Ethiopian Plan')}</title><style>body{font-family:system-ui,sans-serif}table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:.5rem;text-align:left;vertical-align:top}</style></head><body><h1>${esc(plan.name || 'Ethiopian Plan')}</h1><table><thead><tr><th>Ethiopian Date</th><th>Title</th><th>Details</th><th>Status</th></tr></thead><tbody>${rows.map(r => `<tr><td>${esc(dateLabel(r.date))}</td><td>${esc(r.title)}</td><td>${esc(r.details)}</td><td>${esc(r.status)}</td></tr>`).join('')}</tbody></table></body></html>`;
        }
        throw new Error(`Unsupported export format: ${format}`);
    }

    function downloadPlan(plan, format) {
        const extensions = { json: 'json', csv: 'csv', tsv: 'tsv', md: 'md', html: 'html' };
        const mime = { json: 'application/json', csv: 'text/csv', tsv: 'text/tab-separated-values', md: 'text/markdown', html: 'text/html' };
        const blob = new Blob([exportText(plan, format)], { type: mime[format] || 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${(plan.name || 'ethiopian-plan').replace(/[^\p{L}\p{N}_-]+/gu, '_')}.${extensions[format] || 'txt'}`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 0);
    }

    global.EthioPlanner = { addUnit, calculateEndDate, generateSchedule, loadPlans, savePlan, deletePlan, exportText, downloadPlan, dateLabel };
})(window);
