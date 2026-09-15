'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

/*
 * Two real bugs were found building the Agenda tab, both invisible to
 * function-level tests, both only caught by driving the real DOM:
 *
 * 1. Clicking a dynamically-injected nav button does nothing unless that
 *    module wires its own onclick=activate — app.js's setupTabs() only
 *    binds click handlers to nav buttons that exist at the moment it runs,
 *    which is before any later-loaded module's init() has appended its
 *    button. This is a real, working pattern already used by
 *    planning-integrated.js; skipping it silently leaves a tab unreachable.
 *
 * 2. Top-level `const`/`let` in app.js (e.g. SYNAX_MONTH_NAMES_AM) never
 *    becomes a `window.*` property, unlike function declarations — so
 *    referencing it as `window.SYNAX_MONTH_NAMES_AM` from another script
 *    silently resolves to undefined and the lookup it drives quietly
 *    returns nothing, with no thrown error to notice.
 */

function loadAgendaDom(fetchOverride) {
    const dom = new JSDOM(
        '<!DOCTYPE html><html><body><nav role="tablist"><button class="nav-btn active" data-target="tab-today" aria-selected="true">Today</button></nav><main id="main-content"><section id="tab-today" class="tab-content active"></section></main></body></html>',
        { url: 'https://example.com/', runScripts: 'dangerously' }
    );
    const { window } = dom;
    window.fetch = fetchOverride || (async () => ({ json: async () => ({}) }));

    const run = file => window.eval(fs.readFileSync(path.join(__dirname, file), 'utf8'));
    run('app.js');
    run('gitsawe.js');
    run('bible-lookup.js');
    run('planning.js');
    run('planning-integrated.js');
    run('agenda.js');

    return { dom, window, $: id => window.document.getElementById(id) };
}

function tick(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test('agenda tab: clicking the nav button actually switches to it', async () => {
    const { dom, window, $ } = loadAgendaDom();
    await tick();

    assert.ok($('navbtn-agenda'), 'agenda nav button should be injected');
    assert.ok($('tab-agenda'), 'agenda tab section should be injected');
    assert.equal($('tab-agenda').hidden, true, 'agenda tab should start hidden');

    $('navbtn-agenda').click();
    await tick(50);

    assert.equal($('tab-agenda').hidden, false, 'agenda tab should be visible after clicking its nav button');
    assert.equal($('tab-today').hidden, true, 'the previously-active tab should now be hidden');

    dom.window.close();
});

test('agenda tab: daily dashboard finds real Synaxarium entries, not just Gitsawe/holidays', async () => {
    const fetchOverride = async url => {
        const filePath = path.join(__dirname, url);
        if (fs.existsSync(filePath)) return { json: async () => JSON.parse(fs.readFileSync(filePath, 'utf8')) };
        return { json: async () => ({}) };
    };
    const { dom, window, $ } = loadAgendaDom(fetchOverride);
    await tick();

    $('agenda-year').value = 2018;
    $('agenda-month').value = 1;
    $('agenda-day').value = 1;
    $('agenda-dash-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    await tick(300);

    const html = $('agenda-dash-output').innerHTML;
    assert.ok(!html.includes('የስንክሳር መረጃ አልተገኘም'), `Synaxarium lookup should find real entries for Meskerem 1, not report "no entry found". Got: ${html.slice(0, 300)}`);
    assert.ok(html.includes('ርዕሰ ዓውደ ዓመት'), 'the known New Year Synaxarium entry should be present');

    dom.window.close();
});

test('agenda tab: cross-plan task list buckets by date and status edits persist', async () => {
    const { dom, window, $ } = loadAgendaDom();
    await tick();

    const pastPlan = window.EthioPlanner.generateScheduleToDate({ start: { ey: 2010, em: 1, ed: 1 }, end: { ey: 2010, em: 1, ed: 1 }, intervalValue: 1, intervalUnit: 'day' });
    pastPlan.id = 'past-test';
    pastPlan.name = 'Past Plan';
    pastPlan.rows[0].title = 'Overdue item';
    window.EthioPlanner.savePlan(pastPlan);

    $('navbtn-agenda').click();
    await tick(50);

    const html = $('agenda-tasks-output').innerHTML;
    assert.ok(html.includes('Overdue item'), 'a past, unfinished plan row should appear in the task list');

    const select = window.document.querySelector('.agenda-status-select');
    assert.ok(select, 'each task row should have an editable status control');
    select.value = 'done';
    select.dispatchEvent(new window.Event('change', { bubbles: true }));

    const reloaded = window.EthioPlanner.loadPlans().find(p => p.id === 'past-test');
    assert.equal(reloaded.rows[0].status, 'done', 'changing status in the agenda should persist back to the saved plan');

    dom.window.close();
});
