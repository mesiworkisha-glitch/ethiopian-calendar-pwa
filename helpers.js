'use strict';
/**
 * Test helper for loading the browser-only app.js in a Node VM context.
 */
const vm = require('vm');
const fs = require('fs');
const path = require('path');

function loadApp() {
    // The repository keeps app.js at its root alongside the test files.
    const code = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

    class CustomEvent {
        constructor(type, options) {
            this.type = type;
            this.detail = options && options.detail;
        }
    }

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
                lang: '', setAttribute: () => {}, removeAttribute: () => {}, getAttribute: () => null,
            },
            body: { classList: { add: () => {}, remove: () => {} } },
        },
        fetch: async () => ({ json: async () => ({}) }),
        console,
        URL,
        URLSearchParams,
        CustomEvent,
        dispatchEvent: () => true,
        addEventListener: () => {},
        removeEventListener: () => {},
        setTimeout,
        clearTimeout,
    };
    sandbox.self = sandbox.window;
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox, { filename: 'app.js' });
    return sandbox;
}

module.exports = { loadApp };