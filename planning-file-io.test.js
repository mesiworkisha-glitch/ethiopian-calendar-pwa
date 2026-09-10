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
vm.runInContext(fs.readFileSync(path.join(__dirname, 'planning.js'), 'utf8'), app);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'planning-file-io.js'), 'utf8'), app);
const planner = app.EthioPlanner;
const io = app.EthioPlanningFileIO;
const date = (ey, em, ed) => ({ ey, em, ed });

function plan() {
    return planner.generateSchedule({ start: date(2018, 1, 1), periodValue: 5, periodUnit: 'day', intervalValue: 1, intervalUnit: 'day' });
}

test('blank form clears editable fields while preserving dates and seasons', () => {
    const source = plan();
    source.rows[0].title = 'Task';
    source.rows[0].details = 'Details';
    const blank = io.createBlankForm(source);
    assert.equal(blank.rows.length, source.rows.length);
    assert.equal(blank.rows[0].title, '');
    assert.equal(blank.rows[0].details, '');
    assert.deepEqual(JSON.parse(JSON.stringify(blank.rows.map(r => r.date))), JSON.parse(JSON.stringify(source.rows.map(r => r.date))));
});

test('JSON export/import round trips filled plans', () => {
    const source = plan();
    source.name = 'Round trip';
    source.rows[2].title = 'Task three';
    source.rows[2].details = 'Important';
    source.rows[2].status = 'done';
    const restored = io.importText(io.exportForm(source, 'json', false), 'json');
    assert.equal(restored.name, 'Round trip');
    assert.equal(restored.rows[2].title, 'Task three');
    assert.equal(restored.rows[2].details, 'Important');
    assert.equal(restored.rows[2].status, 'done');
    assert.deepEqual(JSON.parse(JSON.stringify(restored.rows.map(r => r.date))), JSON.parse(JSON.stringify(source.rows.map(r => r.date))));
});

test('CSV blank form can be filled externally and imported', () => {
    const source = plan();
    const blank = io.exportForm(source, 'csv', true);
    const lines = blank.split('\n');
    lines[1] += ',My task,My details,planned';
    const restored = io.importText(lines.join('\n'), 'csv', source);
    assert.equal(restored.rows[0].title, 'My task');
    assert.equal(restored.rows[0].details, 'My details');
    assert.equal(restored.rows[0].status, 'planned');
});

test('TSV blank form can be filled externally and imported', () => {
    const source = plan();
    const blank = io.exportForm(source, 'tsv', true);
    const lines = blank.split('\n');
    lines[2] += '\tSecond task\tMore details\tin progress';
    const restored = io.importText(lines.join('\n'), 'tsv', source);
    assert.equal(restored.rows[1].title, 'Second task');
    assert.equal(restored.rows[1].status, 'in progress');
});

test('import rejects dates that are not part of the generated schedule', () => {
    const source = plan();
    const csv = io.exportForm(source, 'csv', true).replace('2018-01-01', '2018-02-01');
    assert.throws(() => io.importText(csv, 'csv', source), /not present in the generated schedule/);
});

test('import rejects malformed Ethiopian dates', () => {
    const source = plan();
    const csv = io.exportForm(source, 'csv', true).replace('2018-01-01', 'bad-date');
    assert.throws(() => io.importText(csv, 'csv', source), /Invalid Ethiopian date/);
});

test('all supported form export formats produce non-empty output', () => {
    const source = plan();
    for (const format of ['csv', 'tsv', 'json', 'md', 'html']) {
        const output = io.exportForm(source, format, true);
        assert.equal(typeof output, 'string');
        assert.ok(output.length > 0);
    }
});
