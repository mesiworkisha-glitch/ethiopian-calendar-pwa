# Internal JavaScript reference

There is no network/HTTP API here — this is a fully static, client-side PWA
with no backend. "API" in this document means the internal JavaScript
surface: the functions, conventions, and global state that `app.js`,
`embed.js`, and the HTML pages share. If you're adding a feature or porting
logic to another platform (as has been done for the NVDA add-on and the
Jieshuo Lua port), this is the map of what calls what.

For the calendar math and Bahire Hasab specifics, see
[`calendar-algorithm.md`](./calendar-algorithm.md) and
[`bahirehasab.md`](./bahirehasab.md). This document covers everything
*around* that: state, i18n, module wiring, and the embed content contract.

## Global state (top of `app.js`)

```js
let currentLang = localStorage.getItem('lang') || 'am';
let useGeezNumerals = localStorage.getItem('use_geez_numerals') === 'true';
```

Both are plain module-scope `let` bindings (not wrapped in a class or
namespace), so any script loaded after `app.js` on the same page — notably
`embed.js` — can read and reassign them directly. This is intentional and is
how `embed.js` applies the widget's `?lang=`/`?numerals=` query params
without needing its own parallel state.

**`localStorage` keys in use:**　
| Key | Values | Set by |
|---|---|---|
| `lang` | `am` \| `en` \| `om` \| `ti` \| `so` | language `<select>` |
| `theme` | `light` \| `dark` | dark-mode toggle button |
| `use_geez_numerals` | `'true'` \| `'false'` (string) | Ge'ez numerals toggle button |
| `periodic_tracker_data` | JSON: `{ periods: [], cycle_len, period_len }` | Period Tracker form (guarded with try/catch — falls back to an in-memory object if storage is blocked, e.g. private browsing) |

## i18n system

`i18n` is one large object keyed by language code, each value itself an
object of `key: translatedString` (or `key: [array]` for things like month
names). All 6 language blocks are required to have **identical key sets** —
`scripts/check-i18n.js` enforces this in CI (see the root `README`/CI docs).

- **`t(key)`** — the only function you should call to read a translation.
  Falls back to Amharic if the current language is missing a key (it never
  should be, per the CI check, but this keeps a bug from being visible to
  users if it ever slips through).
- **`fNum(n)`** — formats a number as either Arabic or Ge'ez numerals,
  depending on `useGeezNumerals`. Use this for **every** user-visible number
  — dates, day counts, years — never interpolate a raw number into UI text.
- **`updateStaticTranslations()`** — walks the DOM once and:
  - sets `innerHTML`/`placeholder` on every `[data-i18n]` element from
    `i18n[currentLang][key]`,
  - sets `aria-label` on every `[data-i18n-aria-label]` element the same way,
  - sets `document.documentElement.lang = currentLang` (important for
    screen readers — see the accessibility notes below).

  Called once on page load and again whenever the language `<select>`
  changes.

**Adding a new translatable string:** add the key to all 6 language blocks
first (or `scripts/check-i18n.js` will fail in CI), then either add
`data-i18n="your_key"` to a static HTML element, or call `t('your_key')`
from JS.

## Module registration & rendering pattern

`app.js` has a single `DOMContentLoaded` listener that runs a fixed list of
setup functions:

```js
const modules = [
    { name: "Tabs Control", func: setupTabs },
    { name: "Today View", func: renderToday },
    // ...
];
modules.forEach(m => { try { m.func(); } catch (err) { console.error(...); } });
```

Every module function is wrapped in its own `try/catch` so one broken module
can't take down the rest of the page. Every module function also guards its
own DOM lookups (`const el = document.getElementById(...); if (!el) return;`)
so it's safe to run on pages that don't have its target elements at all —
this is the entire reason `embed.html`/`embed-*.html` can load `app.js`
unmodified: none of these functions find their targets there, so they
silently no-op, and `embed.js` (loaded after) does the actual rendering for
that page.

**If you add a new module/feature**, follow both conventions: wrap DOM
lookups in `if (!el) return;`, and register the setup function in the
`modules` array rather than calling it from somewhere else — this keeps the
"safe to run anywhere" property intact.

### `refreshLiveOutputs()`

Re-renders every "live" output (Today, This Year, Holidays, Islamic, Hebrew)
and re-runs any form that already has a result showing (Period Tracker, Age
Calculator, Pregnancy Calculator, Converter) by re-dispatching its
submit/click event. Called whenever the language or Ge'ez-numerals setting
changes, so an already-visible result updates in place rather than going
stale.

## Status announcements

```js
function announceStatus(msg) {
    const el = document.getElementById('status-announcer');
    if (!el) return;
    el.textContent = '';
    setTimeout(() => { el.textContent = msg; }, 50);
}
```

`#status-announcer` is an `aria-live="polite"` region. Clearing then
re-setting `textContent` (with a short delay) is a deliberate pattern to
force screen readers to re-announce the same message even if it's identical
to the last one (e.g. "Copied" twice in a row) — simply setting the same
text again wouldn't trigger a new announcement otherwise. Use this for any
transient, non-visual feedback (copy confirmations, save confirmations,
errors) rather than `alert()` or a toast with no ARIA role.

## Embed content contract

Anything that needs to appear in the embed system implements one shape,
returned from `getEmbedWidgetContent(widgetType, extra)`:

```js
{
  title: string,       // short plain-text title (used for badges, canvas headings, share text)
  html: string,         // rich HTML for the live widget / main-app tab
  lines: string[],      // plain-text lines, in priority order (used for share text and the info-card canvas)
  calendarPage?: {       // OPTIONAL — only for single-date widgets (today/holiday/hijri)
    day: string,
    month: string,
    year: string,
    weekday: string,
    sub: string
  }
}
```

`drawEmbedCanvas()` checks for `calendarPage` to decide which of the two
Share Image layouts to use (tear-off day-page vs. bordered info-card) — see
`docs/embedding.md` for the visual details. If you add a new single-date
widget and want the day-page treatment, include `calendarPage`; otherwise
omit it and you'll get the info-card layout automatically.

## Accessibility conventions used throughout

- Every icon-only control has both a visible `title` and an `aria-label` —
  prefer `aria-label` when in doubt, since `title` support across
  screen-reader/browser combinations is inconsistent.
- Toggle buttons (dark mode, Ge'ez numerals) expose `aria-pressed`, kept in
  sync in the same click handler that changes the state — don't add a new
  toggle without this.
- Focus-trapping dialogs (currently just `#embed-modal`) follow the same
  pattern: focus moves into the dialog on open (to the dialog container via
  `tabindex="-1"`), Tab/Shift+Tab is trapped inside via a `keydown` listener,
  focus returns to the triggering element on close, and background
  landmarks (`header`, `nav`, `main`, `footer`) get `inert` +
  `aria-hidden="true"` while open. If you add another modal, copy this
  pattern rather than inventing a new one.
- All interactive tab-like widgets (main nav, the Embed modal's
  Code/Image toggle) follow the WAI-ARIA "tabs" pattern: `role="tablist"` /
  `role="tab"` / `aria-selected` / roving `tabindex` / arrow-key navigation,
  with `role="tabpanel"` + `aria-labelledby` on the corresponding panels.