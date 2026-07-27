# Changelog

All notable changes to this project are documented here. The format is based
on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project uses [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`)
in the `softwareVersion` field of `index.html`'s structured data.

> **Note on this file's history below `3.1.0`:** this changelog was added
> retroactively. The `3.1.0` entry reflects the state of the app as of when
> this file was created, reconstructed from the codebase itself rather than
> from a commit-by-commit history — dates and version numbers for anything
> earlier than that aren't claimed here. From this point forward, add a new
> entry under **Unreleased** with every meaningful change, and move it under
> a dated version heading when you cut a release (see "Using GitHub
> Releases" below).

## [Unreleased]

## [3.1.0] - 2026-07-26

### Added
- Embeddable widgets (`embed.html` + `embed-<widget>.html`) for Today, This
  Year, This Month, Holidays, Synaxarium, Hijri, the Date Converter, and
  individual named holidays/feasts, each configurable via URL query params
  (language, theme, Ge'ez/Arabic numerals, compact badge style).
- In-app "Embed & Share" modal: generates copy-paste `<iframe>` code with a
  live preview, and a downloadable/copyable Share Image (styled as a
  tear-off calendar page for single dates, or a matching bordered card for
  list content), plus pre-filled share links for Telegram, WhatsApp, X, and
  Facebook.
- Basic oEmbed support via static `oembed-<widget>.json` responses and
  discovery `<link>` tags (works with WordPress's oEmbed discovery and
  Discord/Slack's Open Graph-based previews; **not** Twitter/X, which
  requires an approved-provider application Twitter controls, not something
  a static site can opt into).
- Automatic light/dark theme and language detection in embedded widgets
  when not explicitly specified in the URL.
- Two additional languages: Somali (`so`) and Guragigna/Sebat Bet Gurage
  (`gur`), bringing the total to 6 supported languages alongside Amharic,
  English, Afaan Oromoo, and Tigrinya.

### Changed
- The "Today" embed widget now shows the same full detail as the main app's
  Today tab (Gregorian/Julian/Hebrew dates, full Bahire Hasab figures, moon
  phase, sunrise/sunset, zodiac, Awde Negest, today's holidays/Synaxarium)
  instead of a condensed 3-line summary. The "This Year"/"This Month" embed
  and in-app views got the equivalent treatment.
- `renderToday`, `renderYearSearch`, and `renderMonthSearch` were refactored
  so the main app and the embed system share one implementation
  (`buildTodayFullDetails`, `buildYearFullDetails`, `buildMonthFullDetails`)
  instead of maintaining the detail logic twice.

### Accessibility
- Full WCAG pass on the Embed & Share modal: focus trap, focus restored to
  the triggering element on close, background landmarks marked `inert` +
  `aria-hidden` while open, complete WAI-ARIA tabs pattern (roving
  `tabindex`, arrow-key navigation) for the Embed Code / Share Image
  toggle, dynamic alt text on the share-image preview, localized
  `aria-label`s via a new `data-i18n-aria-label` mechanism.
- Site-wide: added a skip-to-main-content link, fixed three button/link
  color combinations that failed WCAG AA contrast (WhatsApp green, Telegram
  blue, Facebook blue — all verified against the actual 4.5:1 threshold,
  not eyeballed), added `aria-pressed` to the dark-mode/Ge'ez-numeral
  toggles, added `scope="col"` to the month-view table, bumped small icon
  buttons to the WCAG 2.5.8 minimum touch-target size, and extended the
  site's focus-ring styling to links and text areas (previously
  buttons/inputs/selects only).

### Removed
- Three initially-added languages (Sidaamu Afoo, Wolaytta, Afar) were
  removed after a translation-confidence review — they were flagged as
  lower-confidence machine-assisted drafts and pulled rather than shipped
  without native-speaker review. Re-adding them properly (with review) is a
  reasonable future contribution.

## Using GitHub Releases

This file tracks *what changed*; [GitHub
Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
is where you publish *that a version shipped*, tied to a git tag. A simple
workflow:

1. Move the relevant `[Unreleased]` entries under a new `## [X.Y.Z]` heading
   in this file, dated `YYYY-MM-DD`.
2. Bump `"softwareVersion"` in `index.html`'s JSON-LD block to match.
3. Commit, then tag: `git tag vX.Y.Z && git push origin vX.Y.Z`.
4. On GitHub, go to **Releases → Draft a new release**, pick the tag you
   just pushed, and paste that changelog section into the release notes
   (GitHub can also auto-generate a contributor/PR list with the "Generate
   release notes" button, which pairs well with a hand-written summary from
   this file rather than replacing it).

Versioning guide (SemVer): bump **patch** (`3.1.1`) for fixes with no new
features, **minor** (`3.2.0`) for new widgets/languages/features that don't
break existing embed URLs or the JS module structure, **major** (`4.0.0`)
only if you change something an existing embedder or contributor would need
to know about to avoid breakage (e.g. renaming a `?widget=` value, changing
`i18n` key names, restructuring the module system).
