# Ethiopian Calendar & Bahire Hasab — User Guide

A free, offline-capable Ethiopian calendar app: exact Bahire Hasab (ባሕረ
ሐሳብ) calculations, movable feasts and fasting seasons, the Synaxarium
(daily saints and commemorations), national holidays, and conversion
between the Ethiopian, Gregorian, Julian, Hebrew, and Hijri (Islamic)
calendars. Built with accessibility as a first priority — every screen
works with a screen reader and full keyboard navigation.

This guide covers what each part of the app does and how to use it. It
does not require any technical background.

---

## Getting started

**Language:** Use the language selector in the header to switch between
Amharic (አማርኛ), English, Afaan Oromoo, Tigrinya (ትግርኛ), and Somali
(Soomaali). Your choice is remembered the next time you open the app.

**Dark mode:** The 🌙 button in the header toggles between light and dark
themes. Also remembered between visits.

**Ge'ez numerals:** The number toggle (፪፲፪) in the header switches all
dates and figures throughout the app between Arabic numerals (1, 2, 3…)
and traditional Ge'ez numerals (፩, ፪, ፫…).

**Skip link:** If you're navigating by keyboard, the very first Tab press
reveals a "Skip to main content" link, letting you jump past the header
and tab bar straight to the page content.

---

## The tabs

The app is organized into tabs across the top. Each one is described
below.

### Today

Everything about the current day at a glance: the Ethiopian date, its
equivalents in the Gregorian, Julian, and Hebrew calendars, the day's
full Bahire Hasab figures (Medeb, Wenber, Tinte Qemer, Abekte, Metqe,
Mebaja Hamer), the current fasting season — including which of the 8
named weeks of Great Lent you're in, if applicable (e.g. "Great Lent —
Week of Mikurab") — the moon phase, sunrise/sunset times, your zodiac
sign and Awde Negest sign, any upcoming feast, today's national holidays
(if any), and today's Synaxarium entries (commemorated saints and
feasts).

Use **Copy Date** to copy today's Ethiopian date to your clipboard.

### This Year

The same depth of detail as Today, but for the whole current Ethiopian
year: this year's Bahire Hasab figures, a list of every month with its
Gregorian start/end dates, the full list of this year's national
holidays, and the full list of this year's movable feasts and fasts
(computed from Bahire Hasab, not fixed calendar dates).

### Holidays

This year's national holidays and religious feast days, listed in date
order with both Ethiopian and Gregorian dates shown. Each entry has a
small 🔗 icon — see "Embedding & Sharing" below.

### Hijri (Islamic) Calendar

Today's date in the Hijri calendar, plus this year's Islamic holidays
(Mawlid, Ramadan, Eid al-Fitr, Eid al-Adha, and others). Note: this uses
the standard *tabular* Hijri calendar (a fixed arithmetic calendar), not
moon-sighting — so it may differ by a day or two from a sighting-based
calendar around month boundaries. **Copy Hijri Date** copies today's
Hijri date to your clipboard.

### Hebrew Calendar

Today's date in the Hebrew calendar, plus this year's Hebrew calendar
events (Rosh Hashanah, Yom Kippur, Passover, and others).

### Date Converter (ቀን መቀየሪያ)

Convert or look up a date across calendars:

1. Choose which calendar your input is in (Ethiopian, Gregorian, Julian,
   Hebrew, or Hijri).
2. Enter a year, and optionally a month and day.
3. Press **Convert / Search**.

What you get back depends on how much you entered:
- **Year only** → that year's full Bahire Hasab details, month list, and
  holidays (same depth as the "This Year" tab, for any year you choose —
  past or future).
- **Year + month** → a full day-by-day table for that month: fasting
  season, liturgical season, and any named events for each day.
- **Full date** → everything about that specific day: all calendar
  equivalents, Bahire Hasab figures, fasting season, moon phase, national
  holidays, movable feasts, and Synaxarium entries for that day.

This is the tool to use if you want to know, for example, what day of
the week your birthday fell on in a specific year, or when a Ethiopian
holiday falls in a year far in the future.

### Synaxarium Search

Search the Synaxarium (ስንክሳር) by the name of a saint or feast (in
Amharic) to find which day(s) it's commemorated.

### Period Tracker

A private cycle tracker using the Ethiopian calendar. Enter the start
date of your last period along with your typical cycle and period
length, and it estimates your next period and shows where you are in
your current cycle. Your data is stored only on your own device — it is
never sent anywhere.

### Age Calculator

Enter a birth date (in the Ethiopian calendar) to get an exact age in
years, months, and total days lived.

### Pregnancy Calculator

Enter the first day of your last menstrual period to get an estimated
due date, current gestational age, and trimester.

---

## Embedding & sharing

Look for a **🔗 Embed / Share** button (or, next to individual holidays,
years, and months, a small 🔗 icon) throughout the app. This opens a
window with two options:

- **Embed Code** — a small snippet you can paste into a blog, personal
  website, or link-in-bio page to show a live, auto-updating version of
  that content (today's date, this year's holidays, a specific feast,
  and more). You can choose the width, height, light/dark theme,
  language, and a compact "badge" style for sidebars.
- **Share Image** — a downloadable image styled like a printed calendar
  page, ready to share on social media, plus one-tap share buttons for
  Telegram, WhatsApp, X, and Facebook.

**Receiving shares:** if you install the app (see below) and share text
from another app using your phone's share menu, this app can appear as a
destination — it will open to the Date Converter tab and show you what
was shared, so you can look up the relevant date.

---

## Installing as an app (and using it offline)

On most phones and computers, your browser will offer an "Install" or
"Add to Home Screen" option for this site — installing it gives you an
app icon, a faster launch, and offline access to everything you've
already loaded.

Once installed:
- **Offline use** — the app keeps working without an internet connection
  for everything except live data that needs a fresh fetch (like a
  first-time Synaxarium lookup you haven't made before). If you're fully
  offline and try to open a page that isn't available, you'll see a
  friendly "You're Offline" screen with a retry button instead of a
  browser error.
- **Shortcuts** — press and hold the app's icon on your home screen for
  quick jumps straight to Today, the Date Converter, Holidays, or the
  Synaxarium search, without opening the full app first.
- **Updates** — when a new version of the app is available, a small
  banner appears at the bottom of the screen letting you refresh
  immediately or dismiss it for now (it'll ask again next time you
  open the app, until you update).

---

## Accessibility

This app is built accessibility-first:

- Full screen reader support (tested with NVDA) — every control has a
  clear, meaningful label.
- Complete keyboard navigation — nothing requires a mouse or touch,
  including the Embed & Share dialog, which properly traps and returns
  keyboard focus like a well-behaved dialog should.
- High-contrast color choices verified against WCAG AA standards.
- A "Skip to main content" link for keyboard users.
- Works correctly with your device's light/dark mode and text size
  settings.

If you run into an accessibility problem using a screen reader or
keyboard, please report it — see "Getting help" below.

---

## Frequently asked questions

**Why does a date shown here sometimes differ by a day from another
calendar app?** Two common reasons: (1) the Hijri calendar here uses the
standard tabular/arithmetic method, not moon-sighting, so it can differ
near month boundaries from a sighting-based source; (2) some other
Ethiopian calendar tools use simplified or approximate Bahire Hasab
rules — this app computes the full traditional algorithm.

**Is my Period Tracker / Age / Pregnancy data private?** Yes. These
calculators run entirely on your device; nothing is uploaded or shared
unless you explicitly use the Embed & Share feature on unrelated content.

**Does this app work without internet?** Yes, once you've opened it at
least once (see "Installing as an app" above).

**Can I use this in my own language?** Amharic, English, Afaan Oromoo,
Tigrinya, and Somali are currently supported. If you'd like to help add
another language, see the project's contribution guidelines.

---

## Getting help

Found a bug, have a question, or want to request a feature? Reach out
via the Telegram link in the app's footer, or open an issue on the
project's GitHub repository if you're comfortable doing so.