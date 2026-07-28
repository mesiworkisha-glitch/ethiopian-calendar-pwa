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

test('getNamedEventsForYear correctly tags fixed-date events as non-movable', () => {
    // Regression test for a real bug: fixed-date holidays (New Year, Meskel,
    // Timkat, Genna, etc.) were previously being displayed under "This
    // Year's Movable Feasts" alongside genuinely Bahire-Hasab-computed ones.
    for (const ey of sampleYears().filter((_, i) => i % 20 === 0)) {
        const events = app.getNamedEventsForYear(ey);
        const fixedKeys = ['hol_enkutatash', 'hol_meskel', 'hol_timkat', 'hol_genna', 'fast_nebiyat', 'fast_gehad', 'fast_filseta', 'hol_filseta_maryam'];
        const movableKeys = ['fest_siklet', 'fest_tensae', 'fast_abiy', 'fest_hosanna'];
        for (const [, key, movable] of events) {
            if (fixedKeys.includes(key)) assert.equal(movable, false, `${key} should be tagged non-movable in year ${ey}`);
            if (movableKeys.includes(key)) assert.equal(movable, true, `${key} should be tagged movable in year ${ey}`);
        }
    }
});

test('buildYearFullDetails never lists a fixed-date holiday under "Movable Feasts"', async () => {
    for (const ey of [2015, 2016, 2017, 2018]) {
        const details = await app.buildYearFullDetails(ey);
        const section = details.html.split(app.t('lbl_year_movable_events'))[1] || '';
        // None of the fixed-holiday translated labels should appear after
        // the "Movable Feasts" heading.
        for (const key of ['hol_enkutatash', 'hol_meskel', 'hol_timkat', 'hol_genna']) {
            const label = app.t(key);
            assert.ok(!section.includes(label), `fixed holiday "${label}" (${key}) leaked into the movable-feasts section for year ${ey}`);
        }
    }
});

test('renderFullDateSearch never lists a national-only holiday under "Movable Feasts"', async () => {
    // Regression test for a real bug found in production: the exact same
    // root cause as buildYearFullDetails's bug (an unfiltered event list
    // dumped under a "Movable" label), but in a different function.
    // Adwa Victory Day (Yekatit 23, a fixed date) is genuinely 'national'
    // type only — it must never also appear under lbl_movable_short.
    function makeOutputCapture() {
        let html = '';
        return { set innerHTML(v) { html = v; }, get innerHTML() { return html; }, get captured() { return html; } };
    }
    for (const ey of [1888, 2010, 2016, 2018]) {
        const out = makeOutputCapture();
        await app.renderFullDateSearch(ey, 6, 23, out); // Yekatit 23 = Adwa Victory Day
        const movableSection = out.captured.split(app.t('lbl_movable_short'))[1] || '';
        const adwaLabel = app.t('hol_adwa');
        assert.ok(!movableSection.startsWith(`:</strong> ${adwaLabel}`) && !movableSection.includes(`>${adwaLabel}<`),
            `year ${ey}: "${adwaLabel}" leaked into the Movable Feasts line of a single-date search result`);
    }
});
test('Great Lent week boundaries: 8 weeks, week 5 lands exactly on Debre Zeyit', () => {
    for (const ey of sampleYears().filter((_, i) => i % 15 === 0)) {
        const bh = app.calculateBahreHasab(ey);
        const abiyDay = (bh.feasts.abiy.m - 1) * 30 + bh.feasts.abiy.d;
        const hosannaDay = (bh.feasts.hosanna.m - 1) * 30 + bh.feasts.hosanna.d;
        const debreZeyitDay = (bh.feasts.debre_zeyit.m - 1) * 30 + bh.feasts.debre_zeyit.d;

        // The day before Abiy Tsom's Monday start is outside Lent's 8 weeks.
        assert.equal(app.getGreatLentWeek(abiyDay - 2, bh), null, `year ${ey}: day before week 1 should be null`);
        // Abiy Tsom's own Monday start falls inside week 1 (started the day before, on ዘወረደ Sunday).
        assert.equal(app.getGreatLentWeek(abiyDay, bh), 'lent_week_1', `year ${ey}: Abiy Tsom start should be in week 1`);
        // Hosanna (Palm Sunday) is week 8, the last one.
        assert.equal(app.getGreatLentWeek(hosannaDay, bh), 'lent_week_8', `year ${ey}: Hosanna should be week 8`);
        // The day after Hosanna's week (i.e. Easter itself) is outside Lent's 8 weeks.
        assert.equal(app.getGreatLentWeek(hosannaDay + 7, bh), null, `year ${ey}: Easter should be null (past week 8)`);
        // Cross-check against the code's own independently-computed Debre
        // Zeyit offset — it must land exactly on the week 5 boundary.
        assert.equal(app.getGreatLentWeek(debreZeyitDay, bh), 'lent_week_5', `year ${ey}: Debre Zeyit should fall exactly on week 5`);
    }
});