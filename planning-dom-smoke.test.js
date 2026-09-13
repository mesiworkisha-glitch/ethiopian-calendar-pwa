'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

/*
 * This suite exists because of a real, shipped bug: planning-integrated.js's
 * render() called EthioPlanner.dateLabel() on every row, but dateLabel was
 * never included in planning.js's exported EthioPlanner object. Every other
 * test in this repo exercises EthioPlanner's functions directly, so none of
 * them could ever have caught a mismatch between what the UI calls and what
 * the engine actually exports — the bug meant clicking "Generate" in the
 * live app threw immediately and silently produced an empty tab, for every
 * user, and nothing here would have known.
 *
 * These tests drive the real DOM (via jsdom) the way a person would: fill
 * the form, click buttons, dispatch file-input change events — rather than
 * calling EthioPlanner's functions directly, precisely so a future export
 * omission like this one fails a test instead of shipping silently.
 */

function loadPlanningDom() {
    const dom = new JSDOM(
        '<!DOCTYPE html><html><body><nav role="tablist"></nav><main id="main-content"></main></body></html>',
        { url: 'https://example.com/', runScripts: 'dangerously' }
    );
    const { window } = dom;
    const run = file => window.eval(fs.readFileSync(path.join(__dirname, file), 'utf8'));

    // app.js's own DOMContentLoaded handler kicks off fetch()/setInterval()
    // side effects this suite has no need for and that don't resolve in a
    // sandboxed jsdom window, so only its pure function-definition portion
    // (everything above where DOMContentLoaded is first registered) is
    // loaded — that boundary is discovered here rather than hardcoded, so
    // this doesn't silently start including live-network code if app.js's
    // structure changes.
    const appSrc = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
    const cutoff = appSrc.indexOf("document.addEventListener('DOMContentLoaded'");
    assert.ok(cutoff > 0, 'app.js structure changed: could not find the DOMContentLoaded boundary to safely truncate at for this test harness.');
    window.eval(appSrc.slice(0, cutoff));

    run('planning.js');
    run('planning-integrated.js');
    run('planning-saved-plans.js');
    run('planning-custom-period.js');

    return { dom, window, $: id => window.document.getElementById(id) };
}

// jsdom fires DOMContentLoaded asynchronously even though the document is
// already fully parsed by the time these scripts run synchronously above,
// so init() (registered as a DOMContentLoaded listener) needs a tick before
// the tab it injects actually exists in the DOM.
function tick(ms = 50) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test('planning tab: generating a schedule renders visible, populated rows', async () => {
    const { dom, window, $ } = loadPlanningDom();
    await tick();

    assert.ok($('planning-year'), 'the planning tab should have injected its form into the DOM');

    $('planning-year').value = 2018;
    $('planning-month').value = 1;
    $('planning-day').value = 1;
    $('planning-period-value').value = 1;
    $('planning-period-unit').value = 'week';
    $('planning-interval-value').value = 1;
    $('planning-interval-unit').value = 'day';
    $('planning-form-integrated').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

    const rows = window.document.querySelectorAll('#planning-schedule-integrated tbody tr');
    assert.equal(rows.length, 7, `expected 7 generated rows; status text was: "${$('planning-status-integrated').textContent}"`);

    dom.window.close();
});

test('planning tab: importing a previously exported plan restores rows without data loss', async () => {
    const { dom, window, $ } = loadPlanningDom();
    await tick();

    $('planning-year').value = 2018;
    $('planning-month').value = 1;
    $('planning-day').value = 1;
    $('planning-period-value').value = 1;
    $('planning-period-unit').value = 'week';
    $('planning-interval-value').value = 1;
    $('planning-interval-unit').value = 'day';
    $('planning-form-integrated').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

    const firstRow = window.document.querySelectorAll('#planning-schedule-integrated tbody tr')[0];
    const [titleInput] = firstRow.querySelectorAll('input, textarea, select');
    titleInput.value = 'Read Psalm 1';
    titleInput.dispatchEvent(new window.Event('input', { bubbles: true }));

    $('planning-name').value = 'Regression Test Plan';
    $('planning-save').click();
    const [saved] = window.EthioPlanner.loadPlans();
    const exportedJson = window.EthioPlanner.exportText(saved, 'json');

    $('planning-clear').click();
    assert.equal(window.document.querySelectorAll('#planning-schedule-integrated tbody tr').length, 0);

    const file = new window.File([exportedJson], 'plan.json', { type: 'application/json' });
    Object.defineProperty($('planning-import-file'), 'files', { value: [file], writable: true, configurable: true });
    $('planning-import-file').dispatchEvent(new window.Event('change', { bubbles: true }));
    await tick(300);

    const rowsAfterImport = window.document.querySelectorAll('#planning-schedule-integrated tbody tr');
    assert.equal(rowsAfterImport.length, 7, `expected 7 rows after import; status text was: "${$('planning-status-integrated').textContent}"`);
    const [restoredTitleInput] = rowsAfterImport[0].querySelectorAll('input, textarea, select');
    assert.equal(restoredTitleInput.value, 'Read Psalm 1');

    dom.window.close();
});
