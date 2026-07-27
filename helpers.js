'use strict';
/**
 * tests/helpers.js
 *
 * app.js is a plain browser script (no module.exports, relies on `window`,
 * `document`, etc.), so to unit-test its pure calendar-math functions we run
 * it inside a Node `vm` context with just enough of a browser shim for it to
 * parse and execute without throwing — then read the functions back off the
 * context object.
 *
 * Only `function` declarations are recovered this way (top-level `let`/
 * `const` bindings, like `currentLang` and `i18n`, are lexically scoped and
 * don't attach to the context object — same as they wouldn't attach to
 * `window` in a real browser either). That's fine for this test suite: every
 * function tested here (gregorianToJdn, calculateBahreHasab, etc.) is pure
 * date arithmetic with no dependency on the current language or i18n state.
 */
const vm = require('vm');
const fs = require('fs');
const path = require('path');

function loadApp() {
    const code = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

    const sandbox = {
        window: {
            location: { href: 'https://example.com/', search: '' },
            parent: { postMessage: () => {} },
            matchMedia: () => ({ matches: false }),
        },
        localStorage: { getItem: () => null, setItem: () => {} },
        navigator: { languages: ['en'], language: 'en', clipboard: {} },
        document: {
            addEventListener: () => {},
            querySelectorAll: () => [],
            getElementById: () => null,
            querySelector: () => null,
            documentElement: {
                lang: '',
                setAttribute: () => {},
                removeAttribute: () => {},
                getAttribute: () => null,
            },
            body: { classList: { add: () => {}, remove: () => {} } },
        },
        fetch: async () => ({ json: async () => ({}) }),
        console,
        URL,
        URLSearchParams,
    };
    sandbox.self = sandbox.window;

    vm.createContext(sandbox);
    vm.runInContext(code, sandbox, { filename: 'app.js' });

    return sandbox;
}

module.exports = { loadApp };
