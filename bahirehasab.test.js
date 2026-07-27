'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers');

const app = loadApp();

// A spread of Ethiopian years to check invariants across, deliberately
// covering all 4 residues of `ey mod 4` (since several rules in this
// calendar depend on which one a given year falls into).
function sampleYears() {
    const years = [];
    for (let y = 1900; y < 2100; y++) years.push(y);
    return years;
}

test('medeb is always in the 19-year cycle range [0, 18]', () => {
    for (const ey of sampleYears()) {
        const bh = app.calculateBahreHasab(ey);
        assert.ok(bh.medeb >= 0 && bh.medeb <= 18, `medeb out of range for year ${ey}: ${bh.medeb}`);
    }
});

test('wenber is always in [0, 18]', () => {
    for (const ey of sampleYears()) {
        const bh = app.calculateBahreHasab(ey);
        assert.ok(bh.wenber >= 0 && bh.wenber <= 18, `wenber out of range for year ${ey}: ${bh.wenber}`);
    }
});

test('abekte and metqe are always in [1, 30] (the "0 treated as 30" rule holds)', () => {
    for (const ey of sampleYears()) {
        const bh = app.calculateBahreHasab(ey);
        assert.ok(bh.abekte >= 1 && bh.abekte <= 30, `abekte out of range for year ${ey}: ${bh.abekte}`);
        assert.ok(bh.metqe >= 1 && bh.metqe <= 30, `metqe out of range for year ${ey}: ${bh.metqe}`);
    }
});

test('wengelawi cycles through the 4 evangelists in a fixed 4-year pattern', () => {
    const seen = new Set();
    for (const ey of sampleYears()) {
        const bh = app.calculateBahreHasab(ey);
        seen.add(bh.wengelawi);
    }
    // Across 200 consecutive years we should see all 4 possibilities and
    // no unexpected 5th value.
    assert.equal(seen.size, 4, `expected exactly 4 distinct wengelawi values, got: ${[...seen].join(', ')}`);
    for (const name of ['ማቴዎስ', 'ማርቆስ', 'ሉቃስ', 'ዮሐንስ']) {
        assert.ok(seen.has(name), `expected wengelawi "${name}" to appear across a 200-year span`);
    }
});

test('movable feasts stay in their fixed chronological order every year', () => {
    // The feast offsets from Mebaja Hamer are fixed, strictly-increasing
    // constants (see docs/bahirehasab.md) — nenewe < abiy < debre_zeyit <
    // hosanna < siklet < tensae < rikbe_kahnat < erget < parakletos. That
    // ordering must hold in the *computed* day-of-year for every year,
    // regardless of where Mebaja Hamer itself lands.
    const order = ['nenewe', 'abiy', 'debre_zeyit', 'hosanna', 'siklet', 'tensae', 'rikbe_kahnat', 'erget', 'parakletos'];
    for (const ey of sampleYears()) {
        const bh = app.calculateBahreHasab(ey);
        const dayNums = order.map(key => {
            const f = bh.feasts[key];
            assert.ok(f, `missing feast "${key}" for year ${ey}`);
            return app.ethiopianDayOfYear(f.m, f.d);
        });
        for (let i = 1; i < dayNums.length; i++) {
            assert.ok(
                dayNums[i] > dayNums[i - 1],
                `feast order violated for year ${ey}: ${order[i - 1]} (day ${dayNums[i - 1]}) should precede ${order[i]} (day ${dayNums[i]})`
            );
        }
    }
});

test('Siklet (Good Friday) always falls on a Friday, and Tensae (Easter) always on a Sunday', () => {
    // This is independent of any specific-date memory — it just checks
    // that the feast's Ethiopian date, converted to a Gregorian weekday,
    // lands where Good Friday / Easter Sunday structurally must.
    for (const ey of sampleYears()) {
        const bh = app.calculateBahreHasab(ey);
        const siklet = app.ethToGregorian(ey, bh.feasts.siklet.m, bh.feasts.siklet.d);
        const tensae = app.ethToGregorian(ey, bh.feasts.tensae.m, bh.feasts.tensae.d);
        assert.equal(siklet.getDay(), 5, `Siklet should be a Friday in year ${ey}, got weekday ${siklet.getDay()}`);
        assert.equal(tensae.getDay(), 0, `Tensae should be a Sunday in year ${ey}, got weekday ${tensae.getDay()}`);
    }
});

test('Tensae (Easter) always falls exactly 2 days after Siklet (Good Friday)', () => {
    for (const ey of sampleYears()) {
        const bh = app.calculateBahreHasab(ey);
        const sikletDay = app.ethiopianDayOfYear(bh.feasts.siklet.m, bh.feasts.siklet.d);
        const tensaeDay = app.ethiopianDayOfYear(bh.feasts.tensae.m, bh.feasts.tensae.d);
        assert.equal(tensaeDay - sikletDay, 2, `year ${ey}: expected Tensae 2 days after Siklet`);
    }
});

test('getFdreHolidays: every entry has a stable id and a valid Gregorian date', () => {
    for (const ey of sampleYears().filter((_, i) => i % 10 === 0)) {
        const holidays = app.getFdreHolidays(ey);
        assert.ok(holidays.length > 0, `no holidays returned for year ${ey}`);
        for (const h of holidays) {
            assert.ok(typeof h.id === 'string' && h.id.length > 0, `holiday missing id in year ${ey}`);
            // Note: h.g comes from the vm sandbox's own realm, so
            // `instanceof Date` would fail here even for a perfectly valid
            // Date — check the internal class tag instead, which is realm-safe.
            assert.equal(Object.prototype.toString.call(h.g), '[object Date]', `holiday "${h.id}" is not a Date in year ${ey}`);
            assert.ok(!Number.isNaN(h.g.getTime()), `holiday "${h.id}" has an invalid date in year ${ey}`);
        }
    }
});

test('getHolidayOccurrence finds both fixed holidays and movable feasts by id', () => {
    const ey = 2016;
    const meskel = app.getHolidayOccurrence('hol_meskel', ey);
    assert.ok(meskel, 'expected to find hol_meskel');
    assert.equal(meskel.em, 1);
    assert.equal(meskel.ed, 17);

    const tensae = app.getHolidayOccurrence('fest_tensae', ey);
    assert.ok(tensae, 'expected to find fest_tensae');

    const bogus = app.getHolidayOccurrence('not_a_real_id', ey);
    assert.equal(bogus, null, 'expected an unknown id to resolve to null, not throw');
});
