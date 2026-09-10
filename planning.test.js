'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp } = require('./helpers');

const app = loadApp();
app.window = app;
const code = fs.readFileSync(path.join(__dirname, 'planning.js'), 'utf8');
vm.createContext(app);
vm.runInContext(code, app, { filename: 'planning.js' });
const p = app.EthioPlanner;

const date = (ey, em, ed) => ({ ey, em, ed });
const sameDate = (actual, expected) => {
    assert.equal(actual.ey, expected.ey);
    assert.equal(actual.em, expected.em);
    assert.equal(actual.ed, expected.ed);
};
const daysInYear = ey => ey === 2011 ? 366 : 365;
const dateFromDayOfYear = (ey, day) => {
    let remaining = day;
    for (let em = 1; em <= 13; em += 1) {
        const length = app.getMonthLength(ey, em);
        if (remaining <= length) return date(ey, em, remaining);
        remaining -= length;
    }
    throw new Error('Invalid Ethiopian day of year.');
};
const findDateForSeason = (ey, category, seasonId) => {
    for (let day = 1; day <= daysInYear(ey); day += 1) {
        const d = dateFromDayOfYear(ey, day);
        const info = p.seasonInfoForDate(d);
        if (p.matchesSeason(info, category, seasonId)) return d;
    }
    return null;
};

test('generates daily entries for a one-week period', () => {
    const plan = p.generateSchedule({ start: date(2018, 1, 1), periodValue: 1, periodUnit: 'week', intervalValue: 1, intervalUnit: 'day' });
    assert.equal(plan.rows.length, 7);
    sameDate(plan.rows[0].date, date(2018, 1, 1));
    sameDate(plan.rows[6].date, date(2018, 1, 7));
    assert.equal(plan.periodMode, 'duration');
});

test('generates every 7 days', () => {
    const plan = p.generateSchedule({ start: date(2018, 1, 1), periodValue: 30, periodUnit: 'day', intervalValue: 7, intervalUnit: 'day' });
    assert.equal(plan.rows.length, 5);
    sameDate(plan.rows[1].date, date(2018, 1, 8));
});

test('supports weekly and yearly interval arithmetic', () => {
    const weekly = p.generateSchedule({ start: date(2018, 1, 1), periodValue: 1, periodUnit: 'month', intervalValue: 1, intervalUnit: 'week' });
    assert.equal(weekly.rows.length, 5);
    sameDate(weekly.rows[1].date, date(2018, 1, 8));

    const yearly = p.generateSchedule({ start: date(2018, 1, 1), periodValue: 3, periodUnit: 'year', intervalValue: 1, intervalUnit: 'year' });
    assert.equal(yearly.rows.length, 3);
    sameDate(yearly.rows[1].date, date(2019, 1, 1));
    sameDate(yearly.rows[2].date, date(2020, 1, 1));
});

test('generates monthly intervals using Ethiopian month arithmetic', () => {
    const plan = p.generateSchedule({ start: date(2018, 1, 30), periodValue: 4, periodUnit: 'month', intervalValue: 1, intervalUnit: 'month' });
    assert.deepEqual(JSON.parse(JSON.stringify(plan.rows.map(r => [r.date.ey, r.date.em, r.date.ed]))), [[2018, 1, 30], [2018, 2, 30], [2018, 3, 30], [2018, 4, 30]]);
});

test('clamps a 30th day correctly when interval crosses Pagume', () => {
    const plan = p.generateSchedule({ start: date(2018, 12, 30), periodValue: 2, periodUnit: 'month', intervalValue: 1, intervalUnit: 'month' });
    sameDate(plan.rows[1].date, date(2018, 13, 5));
});

test('clamps a leap-year Pagume date when adding a year', () => {
    const plan = p.generateSchedule({ start: date(2011, 13, 6), periodValue: 2, periodUnit: 'year', intervalValue: 1, intervalUnit: 'year' });
    sameDate(plan.rows[1].date, date(2012, 13, 5));
});

test('supports arbitrary multi-month and multi-year periods', () => {
    const plan = p.generateSchedule({ start: date(2015, 1, 1), periodValue: 2, periodUnit: 'year', intervalValue: 6, intervalUnit: 'month' });
    assert.equal(plan.rows.length, 5);
    sameDate(plan.rows[4].date, date(2016, 12, 1));
    sameDate(plan.endExclusive, date(2017, 1, 1));
});

test('generates an inclusive explicit Ethiopian date range', () => {
    const plan = p.generateScheduleToDate({ start: date(2018, 1, 1), end: date(2018, 1, 5), intervalValue: 1, intervalUnit: 'day' });
    assert.equal(plan.periodMode, 'date-range');
    assert.equal(plan.periodUnit, 'custom');
    assert.deepEqual(JSON.parse(JSON.stringify(plan.endDate)), { ey: 2018, em: 1, ed: 5 });
    assert.equal(plan.rows.length, 5);
    sameDate(plan.rows[4].date, date(2018, 1, 5));
    sameDate(plan.endExclusive, date(2018, 1, 6));
});

test('supports interval units inside explicit date ranges', () => {
    const plan = p.generateScheduleToDate({ start: date(2018, 1, 1), end: date(2018, 1, 15), intervalValue: 7, intervalUnit: 'day' });
    assert.equal(plan.rows.length, 3);
    sameDate(plan.rows[1].date, date(2018, 1, 8));
    sameDate(plan.rows[2].date, date(2018, 1, 15));
});

test('supports month intervals inside a date range without exceeding the end date', () => {
    const plan = p.generateScheduleToDate({ start: date(2018, 1, 30), end: date(2018, 5, 30), intervalValue: 1, intervalUnit: 'month' });
    assert.equal(plan.rows.length, 5);
    sameDate(plan.rows[4].date, date(2018, 5, 30));
});

test('rejects reversed explicit date ranges', () => assert.throws(() => p.generateScheduleToDate({ start: date(2018, 1, 5), end: date(2018, 1, 1), intervalValue: 1, intervalUnit: 'day' })));
test('rejects non-positive intervals', () => assert.throws(() => p.generateSchedule({ start: date(2018, 1, 1), periodValue: 1, periodUnit: 'month', intervalValue: 0, intervalUnit: 'day' })));
test('rejects non-positive periods', () => assert.throws(() => p.generateSchedule({ start: date(2018, 1, 1), periodValue: 0, periodUnit: 'month', intervalValue: 1, intervalUnit: 'day' })));
test('rejects unsupported units', () => assert.throws(() => p.generateSchedule({ start: date(2018, 1, 1), periodValue: 1, periodUnit: 'quarter', intervalValue: 1, intervalUnit: 'day' })));

test('CSV export contains period metadata and all schedule rows', () => {
    const plan = p.generateSchedule({ start: date(2018, 1, 1), periodValue: 3, periodUnit: 'day', intervalValue: 1, intervalUnit: 'day' });
    plan.name = 'Test';
    plan.rows[1].title = 'ሙከራ';
    const csv = p.exportText(plan, 'csv');
    assert.match(csv, /Planning Mode,Planning Start,Planning End,Planning Period,Planning Interval,Season Filter/);
    assert.match(csv, /duration,2018-01-01,,3 day,1 day,all/);
    assert.match(csv, /2018-01-02,/);
    assert.match(csv, /ሙከራ/);
});

test('all supported text export formats include the generated schedule', () => {
    const plan = p.generateSchedule({ start: date(2018, 1, 1), periodValue: 3, periodUnit: 'day', intervalValue: 1, intervalUnit: 'day' });
    plan.name = 'Export Test';
    plan.rows[0].title = 'Task one';
    for (const format of ['csv', 'tsv', 'md', 'html', 'json']) {
        const output = p.exportText(plan, format);
        assert.equal(typeof output, 'string');
        assert.ok(output.length > 0, `${format} export should not be empty`);
        if (format === 'json') {
            const parsed = JSON.parse(output);
            assert.equal(parsed.name, 'Export Test');
            assert.equal(parsed.rows.length, 3);
        } else {
            assert.match(output, /2018-01-01/);
            assert.match(output, /Task one/);
        }
    }
});

test('date-range export preserves explicit end date', () => {
    const plan = p.generateScheduleToDate({ start: date(2018, 1, 1), end: date(2018, 1, 5), intervalValue: 1, intervalUnit: 'day' });
    const md = p.exportText(plan, 'md');
    assert.match(md, /Planning Range: 2018-01-01 through 2018-01-05/);
    const json = JSON.parse(p.exportText(plan, 'json'));
    assert.equal(json.periodMode, 'date-range');
    sameDate(json.endDate, date(2018, 1, 5));
});

test('JSON export round-trips plan structure and season metadata', () => {
    const plan = p.generateSchedule({ start: date(2018, 1, 1), periodValue: 1, periodUnit: 'week', intervalValue: 1, intervalUnit: 'day' });
    const parsed = JSON.parse(p.exportText(plan, 'json'));
    assert.equal(parsed.rows.length, 7);
    assert.equal(parsed.start.ey, 2018);
    assert.ok(parsed.rows[0].season);
});

test('season catalog contains every supported season family', () => {
    const c = p.getSeasonCatalog();
    assert.equal(c.climatic.length, 4);
    assert.ok(c.fasting.length >= 9);
    assert.ok(c.liturgical.length >= 20);
    assert.equal(c['lent-week'].length, 8);
    for (const item of [...c.climatic, ...c.fasting, ...c.liturgical, ...c['lent-week']]) {
        assert.ok(item.id, 'every season must have an id');
        assert.ok(item.label, `season ${item.id} must have a label`);
    }
});

test('seasonInfoForDate uses the same season engine as the PWA', () => {
    const info = p.seasonInfoForDate(date(2018, 1, 26));
    assert.ok(info.climatic);
    assert.ok(info.fasting);
    assert.ok(info.liturgical);
});

test('every climatic season can be selected and produces only matching rows', () => {
    const catalog = p.getSeasonCatalog();
    for (const season of catalog.climatic) {
        const matchingDate = findDateForSeason(2018, 'climatic', season.id);
        assert.ok(matchingDate, `no date found for climatic season ${season.id}`);
        const plan = p.generateSchedule({ start: matchingDate, periodValue: 1, periodUnit: 'day', intervalValue: 1, intervalUnit: 'day', seasonCategory: 'climatic', seasonId: season.id });
        assert.equal(plan.rows.length, 1, `climatic filter failed for ${season.id}`);
        assert.equal(plan.rows[0].season.climatic, season.label);
    }
});

test('every fasting season can be selected and produces a matching row', () => {
    const catalog = p.getSeasonCatalog();
    for (const season of catalog.fasting) {
        const matchingDate = findDateForSeason(2018, 'fasting', season.id);
        assert.ok(matchingDate, `no date found for fasting season ${season.id}`);
        const plan = p.generateSchedule({ start: matchingDate, periodValue: 1, periodUnit: 'day', intervalValue: 1, intervalUnit: 'day', seasonCategory: 'fasting', seasonId: season.id });
        assert.equal(plan.rows.length, 1, `fasting filter failed for ${season.id}`);
        assert.equal(p.matchesSeason(plan.rows[0].season, 'fasting', season.id), true);
    }
});

test('every liturgical season can be selected and produces a matching row', () => {
    const catalog = p.getSeasonCatalog();
    for (const season of catalog.liturgical) {
        const matchingDate = findDateForSeason(2018, 'liturgical', season.id);
        assert.ok(matchingDate, `no date found for liturgical season ${season.id}`);
        const plan = p.generateSchedule({ start: matchingDate, periodValue: 1, periodUnit: 'day', intervalValue: 1, intervalUnit: 'day', seasonCategory: 'liturgical', seasonId: season.id });
        assert.equal(plan.rows.length, 1, `liturgical filter failed for ${season.id}`);
        assert.equal(plan.rows[0].season.liturgical, season.label);
    }
});

test('each Great Lent week can be selected when it occurs in the year', () => {
    const catalog = p.getSeasonCatalog()['lent-week'];
    for (const season of catalog) {
        const matchingDate = findDateForSeason(2018, 'lent-week', season.id);
        assert.ok(matchingDate, `no date found for Great Lent week ${season.id}`);
        const plan = p.generateSchedule({ start: matchingDate, periodValue: 1, periodUnit: 'day', intervalValue: 1, intervalUnit: 'day', seasonCategory: 'lent-week', seasonId: season.id });
        assert.equal(plan.rows.length, 1, `Great Lent filter failed for ${season.id}`);
        assert.equal(plan.rows[0].season.greatLentWeek, season.label);
    }
});

test('season filtering across a full year returns only selected dates', () => {
    const matchingDate = findDateForSeason(2018, 'climatic', 'winter');
    assert.ok(matchingDate);
    const plan = p.generateSchedule({ start: date(2018, 1, 1), periodValue: 1, periodUnit: 'year', intervalValue: 1, intervalUnit: 'day', seasonCategory: 'climatic', seasonId: 'winter' });
    assert.ok(plan.rows.length > 0);
    assert.ok(plan.rows.length < 365);
    assert.ok(plan.rows.every(row => p.matchesSeason(row.season, 'climatic', 'winter')));
});

test('all-season filtering leaves the schedule unchanged', () => {
    const all = p.generateSchedule({ start: date(2018, 1, 1), periodValue: 1, periodUnit: 'month', intervalValue: 1, intervalUnit: 'day', seasonCategory: 'all', seasonId: 'all' });
    const omitted = p.generateSchedule({ start: date(2018, 1, 1), periodValue: 1, periodUnit: 'month', intervalValue: 1, intervalUnit: 'day' });
    assert.equal(all.rows.length, omitted.rows.length);
    assert.deepEqual(JSON.parse(JSON.stringify(all.rows.map(r => r.date))), JSON.parse(JSON.stringify(omitted.rows.map(r => r.date))));
});

test('persistence saves, updates and deletes named plans', () => {
    const store = new Map();
    app.localStorage = {
        getItem: key => store.has(key) ? store.get(key) : null,
        setItem: (key, value) => store.set(key, value)
    };
    const plan = p.generateSchedule({ start: date(2018, 1, 1), periodValue: 1, periodUnit: 'week', intervalValue: 1, intervalUnit: 'day' });
    plan.id = 'test-plan';
    plan.name = 'Saved plan';
    p.savePlan(plan);
    assert.equal(p.loadPlans().length, 1);
    plan.name = 'Updated plan';
    p.savePlan(plan);
    assert.equal(p.loadPlans()[0].name, 'Updated plan');
    p.deletePlan(plan.id);
    assert.equal(p.loadPlans().length, 0);
});
