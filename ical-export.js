(function (root) {
    'use strict';

    function pad2(n) { return String(n).padStart(2, '0'); }
    function icsDateStr(gDate) { return `${gDate.getFullYear()}${pad2(gDate.getMonth() + 1)}${pad2(gDate.getDate())}`; }
    function icsEscape(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
    function addDays(gDate, days) { const d = new Date(gDate); d.setDate(d.getDate() + days); return d; }
    function foldLine(line) {
        // RFC 5545 requires folding lines longer than 75 octets; this is a
        // simple char-based approximation (fine for the ASCII-heavy fields
        // used here — UID/DTSTAMP/DTSTART/DTEND — and safe even when it's
        // conservative for multi-byte SUMMARY/DESCRIPTION text).
        if (line.length <= 75) return line;
        let out = line.slice(0, 75), rest = line.slice(75);
        while (rest.length) { out += '\r\n ' + rest.slice(0, 74); rest = rest.slice(74); }
        return out;
    }

    function buildVevent({ uid, summary, description, startG, endG }) {
        const now = new Date();
        const stamp = `${now.getUTCFullYear()}${pad2(now.getUTCMonth() + 1)}${pad2(now.getUTCDate())}T${pad2(now.getUTCHours())}${pad2(now.getUTCMinutes())}${pad2(now.getUTCSeconds())}Z`;
        return [
            'BEGIN:VEVENT',
            foldLine(`UID:${uid}`),
            `DTSTAMP:${stamp}`,
            `DTSTART;VALUE=DATE:${icsDateStr(startG)}`,
            `DTEND;VALUE=DATE:${icsDateStr(endG)}`,
            foldLine(`SUMMARY:${icsEscape(summary)}`),
            description ? foldLine(`DESCRIPTION:${icsEscape(description)}`) : null,
            'END:VEVENT'
        ].filter(Boolean).join('\r\n');
    }

    function buildCalendar(vevents, calName) {
        return [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Ethiopian Calendar and Bahire Hasab//EN',
            'CALSCALE:GREGORIAN',
            foldLine(`X-WR-CALNAME:${icsEscape(calName)}`),
            ...vevents,
            'END:VCALENDAR'
        ].join('\r\n');
    }

    function downloadIcs(text, filename) {
        const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 0);
    }

    function googleCalendarUrl({ summary, description, startG, endG }) {
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: summary,
            dates: `${icsDateStr(startG)}/${icsDateStr(endG)}`
        });
        if (description) params.set('details', description);
        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    }

    root.EthioIcal = { buildVevent, buildCalendar, downloadIcs, googleCalendarUrl, addDays, icsDateStr, icsEscape };
})(typeof window !== 'undefined' ? window : globalThis);
