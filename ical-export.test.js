'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp } = require('./helpers');

const app = loadApp();
app.window = app;
vm.createContext(app);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'ical-export.js'), 'utf8'), app, { filename: 'ical-export.js' });
const Ical = app.EthioIcal;

test('buildVevent produces a well-formed all-day VEVENT block', () => {
    const startG = new Date(2026, 7, 19), endG = new Date(2026, 7, 20);
    const vevent = Ical.buildVevent({ uid: 'x@y', summary: 'Buhe', description: 'A feast', startG, endG });
    assert.ok(vevent.startsWith('BEGIN:VEVENT'));
    assert.ok(vevent.trim().endsWith('END:VEVENT'));
    assert.ok(vevent.includes('DTSTART;VALUE=DATE:20260819'));
    assert.ok(vevent.includes('DTEND;VALUE=DATE:20260820'));
    assert.ok(vevent.includes('SUMMARY:Buhe'));
    assert.ok(vevent.includes('DESCRIPTION:A feast'));
});

test('buildVevent escapes ICS special characters in text fields', () => {
    const vevent = Ical.buildVevent({ uid: 'x@y', summary: 'A, B; C\\D', startG: new Date(2026, 0, 1), endG: new Date(2026, 0, 2) });
    assert.ok(vevent.includes('SUMMARY:A\\, B\\; C\\\\D'));
});

test('buildCalendar wraps events in a valid VCALENDAR', () => {
    const vevent = Ical.buildVevent({ uid: 'x@y', summary: 'Test', startG: new Date(2026, 0, 1), endG: new Date(2026, 0, 2) });
    const cal = Ical.buildCalendar([vevent], 'My Calendar');
    assert.ok(cal.startsWith('BEGIN:VCALENDAR'));
    assert.ok(cal.trim().endsWith('END:VCALENDAR'));
    assert.ok(cal.includes('VERSION:2.0'));
    assert.ok(cal.includes('X-WR-CALNAME:My Calendar'));
});

test('googleCalendarUrl builds a correctly-formed add-event link', () => {
    const url = Ical.googleCalendarUrl({ summary: 'Buhe', description: 'desc', startG: new Date(2026, 7, 19), endG: new Date(2026, 7, 20) });
    assert.ok(url.startsWith('https://calendar.google.com/calendar/render?'));
    assert.ok(url.includes('dates=20260819%2F20260820'));
    assert.ok(url.includes('text=Buhe'));
});

test('getFastingPeriods returns exactly the 5 named fasts with real, non-overlapping-with-nothing ranges', () => {
    const periods = app.getFastingPeriods(2018);
    assert.equal(periods.length, 5);
    // periods/ids are vm-realm arrays; JSON round-trip to compare by value
    // rather than prototype identity (same issue as planning-files.test.js).
    const ids = JSON.parse(JSON.stringify(periods.map(p => p.id).sort()));
    assert.deepEqual(ids, ['fast_abiy', 'fast_filseta', 'fast_hawaryat', 'fast_nebiyat', 'fast_nenewe'].sort());
    periods.forEach(p => {
        assert.equal(typeof p.startG.getTime, 'function', `${p.id} startG should be a Date-like object`);
        assert.equal(typeof p.endG.getTime, 'function', `${p.id} endG should be a Date-like object`);
        assert.ok(p.endG.getTime() >= p.startG.getTime(), `${p.id} end date should not be before its start date`);
    });
});

test('getMovableFeasts returns only the Bahire-Hasab-computed entries, matching getNamedEventsForYear\'s own movable flag', () => {
    const feasts = app.getMovableFeasts(2018);
    const expectedMovableCount = app.getNamedEventsForYear(2018).filter(([, , movable]) => movable).length;
    assert.equal(feasts.length, expectedMovableCount);
    // f.g is a Date constructed inside the vm realm, so `instanceof Date`
    // (checked against this file's own Date) would always be false here —
    // duck-type instead.
    feasts.forEach(f => assert.equal(typeof f.g.getTime, 'function'));
});
