# Embedding & sharing

The app exposes several pieces of its content as standalone, embeddable
widgets — for blog posts, personal sites, or link-in-bio pages — plus a
"Share Image" feature for social media, and basic oEmbed support for
platforms that auto-preview links (currently: WordPress reliably; Discord
and Slack via Open Graph tags; **not** Twitter/X — see the caveat below).

## Architecture

```
embed.html                 ← generic widget page, reads everything from ?query params
embed-today.html            embed-year.html
embed-holidays.html         embed-month.html      ← thin wrapper pages, one per
embed-synaxarium.html                                widget type, each pinning
embed-hijri.html                                     a default via
embed-converter.html                                 window.EMBED_WIDGET_DEFAULT,
                                                       for stable oEmbed URLs

embed.js                   ← renders the requested widget into #embed-widget
oembed.json                ← static oEmbed response for the root site link
oembed-<widget>.json        ← one static oEmbed response per wrapper page
```

`embed.js` is loaded *after* `app.js` on every embed page, and reuses
`app.js`'s calendar-math functions directly (`getEmbedWidgetContent()`,
`calculateBahreHasab()`, `gregorianToJdn()`, etc.) rather than duplicating
any logic. This is why `app.js`'s `DOMContentLoaded` handler is written so
defensively (`if (!container) return;` on every render function) — it runs
unmodified on embed pages too, where most of its target elements simply
don't exist, and silently no-ops.

## Widget types

| `?widget=` value | Shows | Notes |
|---|---|---|
| `today` (default) | Full "Today" detail — same content as the main app's Today tab | |
| `holidays` | This Ethiopian year's national holidays | |
| `synaxarium` | Today's Synaxarium entries (saints/feasts) | |
| `hijri` | Today's Hijri date + a small interactive Gregorian→Hijri/Ethiopian converter | The converter form only appears in the live widget, not in the Share Image |
| `converter` | The full multi-calendar date converter, reusing `setupConverter()` as-is | |
| `year` | Full "This Year" detail (Bahire Hasab figures, month spans, holidays, movable feasts) | `?y=` picks the Ethiopian year; defaults to the current one |
| `month` | Day-by-day table for one Ethiopian month | `?y=&m=` pick year/month; defaults to the current one |
| `holiday` | One specific named holiday/feast | Requires `?id=` — see below |

## Query parameters

| Param | Values | Behavior when omitted |
|---|---|---|
| `widget` | any value from the table above | `today` |
| `lang` | `am`, `en`, `om`, `ti`, `so`, `gur` | **Auto-detected** from the visitor's browser language (`navigator.languages`), falling back to `am` |
| `theme` | `light`, `dark` | **Auto-detected** from `prefers-color-scheme` |
| `numerals` | `geez`, `arabic` | `arabic` |
| `style` | `badge` | Full widget (omit for the normal card layout) |
| `id` | a stable holiday key, e.g. `hol_meskel`, `fest_tensae` | required only for `widget=holiday` |
| `y` | an Ethiopian year number | current Ethiopian year (for `widget=year`/`month`) |
| `m` | Ethiopian month number, 1–13 | current Ethiopian month (for `widget=month`) |

**Stable holiday IDs.** `getFdreHolidays()` tags every entry with a
language-independent `id` (the i18n key it's translated from, e.g.
`hol_meskel`, `hol_timkat`, `fest_siklet`, `fest_tensae`) so a link to a
specific holiday keeps working regardless of which language the visitor's
browser requests. `getHolidayOccurrence(id, ey)` looks these up across both
the fixed national-holiday list and the movable feasts/fasts list.

## Compact badge format

Adding `&style=badge` renders a small single-line pill (icon + title) instead
of the full card — meant for sidebars or footers, similar in spirit to a
"GitHub stars" badge. It works for any widget type; the badge text is just
that widget's `content.title`.

## The Embed & Share modal (in the main app)

Every embeddable view has a 🔗 **Embed / Share** trigger somewhere in the UI
— a button on the relevant tab, or (for `holiday`/`year`/`month`) an inline
icon next to the specific item. Clicking one opens `#embed-modal`, which has
two panels:

- **Embed Code** — width/height/theme/language/format controls, a
  copy-paste `<iframe>` snippet, and a live preview (literally an `<iframe>`
  pointed at `embed.html` with the current settings — not a simulation).
- **Share Image** — a canvas-rendered PNG, styled like a printed calendar
  page for single-date widgets (huge day number, month band, perforation
  dots) or a matching bordered info-card for list-style widgets. Includes
  Download, Copy-to-clipboard, and pre-filled share links for Telegram,
  WhatsApp, X, and Facebook.

If you're adding a **new** widget type, the modal needs no changes — it
calls the same `getEmbedWidgetContent(widgetType, extra)` function that
`embed.js` uses, so as long as your new widget type is added to
`EMBED_WIDGET_TYPES` and handled inside `getEmbedWidgetContent()`, both the
live widget and the modal's preview/share-image/share-text pick it up
automatically.

## oEmbed support — what it actually does (and doesn't)

This site is static (GitHub Pages), so there's no server to answer an
oEmbed request dynamically for an arbitrary URL — that's normally how
oEmbed works (a consumer calls `your-oembed-endpoint?url=<page>&format=json`
and expects a response tailored to that exact URL). Instead:

- The 6 `embed-<widget>.html` wrapper pages each declare a
  `<link rel="alternate" type="application/json+oembed">` discovery tag
  pointing at their own **static** `oembed-<widget>.json` file.
- `index.html` itself links to the root `oembed.json` (a "today" widget by
  default).

**What this gets you in practice:**

- ✅ **WordPress** — its oEmbed client checks for exactly this discovery
  link on domains it doesn't already have a provider entry for, so pasting
  one of these URLs into a WordPress post/block should auto-embed it.
- ✅ **Discord / Slack** — these mostly rely on Open Graph (`og:title`,
  `og:description`, `og:image`) rather than the oEmbed JSON protocol for
  arbitrary domains, and each wrapper page has those tags set.
- ❌ **Twitter/X** — does *not* do generic oEmbed discovery; it only embeds
  links from a curated allow-list of providers that have applied and been
  approved through Twitter's own process. There's no static-site workaround
  for this — if you want it, it means applying to Twitter directly.

If you add a new widget type and want it to participate in oEmbed, follow
the pattern of any existing `embed-<widget>.html` + `oembed-<widget>.json`
pair rather than trying to make discovery fully dynamic — that's not
achievable without adding a server.

## Auto light/dark and auto language

When `theme`/`lang` are omitted from the URL, `embed.js` detects them from
the visitor's own browser (`prefers-color-scheme` and `navigator.languages`)
rather than defaulting to a fixed value. The Embed modal's Theme and
Language selects both have an explicit "Auto" option (empty value) that
reproduces this — picking a specific language/theme in the modal simply adds
that param to the generated URL; picking "Auto" omits it.
