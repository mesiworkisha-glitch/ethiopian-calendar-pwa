#!/usr/bin/env node
/**
 * check-i18n.js
 *
 * Verifies that every language block inside app.js's `i18n` object defines
 * exactly the same set of keys. This project supports 6 languages (am, en,
 * om, ti, so) and it's easy for a key to be added to one language while
 * writing a feature and forgotten in the other five — this script catches
 * that before it ships.
 *
 * Usage: node scripts/check-i18n.js [path-to-app.js]
 * Exit code: 0 if all languages match, 1 if any mismatch is found.
 */
const fs = require('fs');
const path = require('path');

const appJsPath = process.argv[2] || path.join(__dirname, '..', 'app.js');
const code = fs.readFileSync(appJsPath, 'utf8');

const startIdx = code.indexOf('const i18n');
if (startIdx === -1) {
    console.error(`Could not find "const i18n" in ${appJsPath}`);
    process.exit(1);
}
const endIdx = code.indexOf('\n};', startIdx) + 3;
const i18nSource = code.slice(startIdx, endIdx);

let i18n;
try {
    // The i18n object is plain JS data (no external references), so it's safe
    // to evaluate in isolation just to read its structure back out.
    i18n = new Function(`${i18nSource}\nreturn i18n;`)();
} catch (e) {
    console.error('Failed to parse the i18n object:', e.message);
    process.exit(1);
}

const languages = Object.keys(i18n);
if (languages.length === 0) {
    console.error('No languages found in the i18n object.');
    process.exit(1);
}

const referenceLang = 'am';
if (!i18n[referenceLang]) {
    console.error(`Reference language "${referenceLang}" not found.`);
    process.exit(1);
}

const referenceKeys = Object.keys(i18n[referenceLang]).sort();
let ok = true;

for (const lang of languages) {
    const keys = Object.keys(i18n[lang]).sort();
    const missing = referenceKeys.filter(k => !keys.includes(k));
    const extra = keys.filter(k => !referenceKeys.includes(k));
    if (missing.length || extra.length) {
        ok = false;
        console.error(`\n[${lang}] key mismatch:`);
        if (missing.length) console.error(`  missing: ${missing.join(', ')}`);
        if (extra.length) console.error(`  extra:   ${extra.join(', ')}`);
    }
}

if (ok) {
    console.log(`i18n OK — ${languages.length} languages (${languages.join(', ')}), ${referenceKeys.length} keys each.`);
    process.exit(0);
} else {
    console.error('\ni18n check FAILED — see mismatches above.');
    process.exit(1);
}