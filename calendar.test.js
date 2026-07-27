'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers');

const app = loadApp();

// ---------------------------------------------------------------------
// Anchor facts — well-established, independently verifiable reference
// points (not just "the code agrees with itself").
// ---------------------------------------------------------------------

test('Gregorian->JDN matches the J2000.0 epoch (Jan 1, 2000 = JDN 2451545)', () => {
    assert.equal(app.gregorianToJdn(2000, 1, 1), 2451545);
});

test('Ethiopian epoch matches the JDN this codebase declares for it', () => {
    // ethiopianToJdn(1,1,1) should equal the ETHIOPIAN_JDN_EPOCH constant
    // used throughout the file. This is a self-consistency check: it
    // catches an arithmetic typo in ethiopianToJdn even though it can't
    // independently prove 1724221 is "correct" astronomically.
    assert.equal(app.ethiopianToJdn(1, 1, 1), 1724221);
});

test('Islamic epoch matches the historically-cited Hijra date (July 16, 622 CE, Julian calendar)', () => {
    // ISLAMIC_EPOCH = 1948440 is both the constant in the source AND the
    // widely-documented JDN for 1 Muharram, AH 1 — check both directions.
    // Note: the historical "July 16, 622" date is conventionally cited in
    // the *Julian* calendar (standard practice for any pre-1582 date,
    // since the Gregorian calendar didn't exist yet) — not proleptic
    // Gregorian, which would land on July 19 instead.
    assert.equal(app.islamicToJdn(1, 1, 1), 1948440);
    const j = app.jdnToJulian(1948440);
    assert.equal(j.jy, 622);
    assert.equal(j.jm, 7);
    assert.equal(j.jd, 16);
});

// ---------------------------------------------------------------------
// Round-trip tests — convert forward then back, across a wide spread of
// dates (including leap-year and month/year boundary edge cases), and
// confirm we land back where we started. These don't depend on any
// external fact beyond "conversion and its inverse should compose to
// identity", so they're safe to run broadly.
// ---------------------------------------------------------------------

// A spread of JDNs covering ~400 years, deliberately including several
// multiples of 4 (leap-year-adjacent) in each calendar's terms.
function sampleJdns() {
    const base = app.gregorianToJdn(1900, 1, 1);
    const days = [];
    for (let y = 0; y < 400; y += 3) {
        for (const doy of [1, 59, 60, 61, 200, 365, 366]) {
            days.push(base + y * 365 + doy);
        }
    }
    return days;
}

test('Gregorian round-trip (JDN -> Gregorian -> JDN)', () => {
    for (const jdn of sampleJdns()) {
        const g = app.jdnToGregorian(jdn);
        const back = app.gregorianToJdn(g.getFullYear(), g.getMonth() + 1, g.getDate());
        assert.equal(back, jdn, `Gregorian round-trip failed at JDN ${jdn}`);
    }
});

test('Ethiopian round-trip (JDN -> Ethiopian -> JDN)', () => {
    for (const jdn of sampleJdns()) {
        const e = app.jdnToEthiopian(jdn);
        assert.ok(e.em >= 1 && e.em <= 13, `month out of range at JDN ${jdn}: ${e.em}`);
        assert.ok(e.ed >= 1 && e.ed <= 30, `day out of range at JDN ${jdn}: ${e.ed}`);
        const back = app.ethiopianToJdn(e.ey, e.em, e.ed);
        assert.equal(back, jdn, `Ethiopian round-trip failed at JDN ${jdn}`);
    }
});

test('Julian round-trip (JDN -> Julian -> JDN)', () => {
    for (const jdn of sampleJdns()) {
        const j = app.jdnToJulian(jdn);
        const back = app.julianToJdn(j.jy, j.jm, j.jd);
        assert.equal(back, jdn, `Julian round-trip failed at JDN ${jdn}`);
    }
});

test('Islamic round-trip (JDN -> Islamic -> JDN)', () => {
    for (const jdn of sampleJdns()) {
        const isl = app.jdnToIslamic(jdn);
        assert.ok(isl.im >= 1 && isl.im <= 12, `Islamic month out of range at JDN ${jdn}: ${isl.im}`);
        const back = app.islamicToJdn(isl.iy, isl.im, isl.id);
        assert.equal(back, jdn, `Islamic round-trip failed at JDN ${jdn}`);
    }
});

test('Hebrew round-trip (JDN -> Hebrew -> JDN)', () => {
    for (const jdn of sampleJdns()) {
        const h = app.jdnToHebrew(jdn);
        const back = app.hebrewToJdn(h.hy, h.hm, h.hd);
        assert.equal(back, jdn, `Hebrew round-trip failed at JDN ${jdn}`);
    }
});

// ---------------------------------------------------------------------
// Structural rules that must hold regardless of which specific year is
// picked — these encode the calendars' own stated rules, verified
// against the source's own formulas (see docs/calendar-algorithm.md).
// ---------------------------------------------------------------------

test('Ethiopian month lengths: 30 days for months 1-12, 5 or 6 for Pagumē (13)', () => {
    for (let ey = 1; ey < 2100; ey += 7) {
        for (let em = 1; em <= 12; em++) {
            assert.equal(app.getMonthLength(ey, em), 30, `month ${em} of year ${ey} should be 30 days`);
        }
        const pagumeLen = app.getMonthLength(ey, 13);
        const expected = (((ey % 4) + 4) % 4) === 3 ? 6 : 5;
        assert.equal(pagumeLen, expected, `Pagumē length wrong for year ${ey}`);
    }
});

test('Islamic month lengths: odd months 30 days, even months 29 (month 12 leap-dependent)', () => {
    for (let iy = 1; iy < 1600; iy += 5) {
        for (let im = 1; im <= 11; im++) {
            const expected = im % 2 === 1 ? 30 : 29;
            assert.equal(app.getIslamicMonthLength(iy, im), expected, `Islamic month ${im} of year ${iy}`);
        }
        const leap = app.isIslamicLeap(iy);
        assert.equal(app.getIslamicMonthLength(iy, 12), leap ? 30 : 29, `Islamic month 12 (leap-dependent) of year ${iy}`);
    }
});

test('Hebrew leap years occur exactly 7 times in every 19-year cycle', () => {
    for (let cycleStart = 1; cycleStart < 6000; cycleStart += 19 * 3) {
        let leapCount = 0;
        for (let y = cycleStart; y < cycleStart + 19; y++) {
            if (app.hebrewLeap(y)) leapCount++;
        }
        assert.equal(leapCount, 7, `expected 7 leap years in the 19-year cycle starting at ${cycleStart}`);
    }
});
