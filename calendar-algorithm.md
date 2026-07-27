# Calendar conversion algorithm

Every calendar conversion in this app — Ethiopian, Gregorian, Julian,
Hebrew, and Islamic (Hijri) — is done by converting to and from a shared,
calendar-agnostic pivot: the **Julian Day Number (JDN)**, an integer count
of days since a fixed epoch in the distant past (4713 BCE proleptic
Julian). Once any date is expressed as a JDN, converting it to any *other*
calendar is just running that calendar's own JDN formula in reverse. This is
the same technique used by most serious calendrical-calculation libraries,
rather than trying to convert calendars pairwise.

```
Ethiopian ⇄ JDN ⇄ Gregorian
              ⇅
            Julian
              ⇅
            Hebrew
              ⇅
            Islamic (Hijri)
```

All of the functions below live in `app.js`.

## Gregorian ⇄ JDN

`gregorianToJdn(gy, gm, gd)` / `jdnToGregorian(jdn)` implement the standard
Fliegel & Van Flandern algorithm — the same one used almost everywhere JDN
conversion is needed. No custom logic here; if you're debugging a Gregorian
date issue, the bug is almost certainly upstream (in whichever function
produced the JDN) rather than in this pair.

## Julian ⇄ JDN

`jdnToJulian(jdn)` / `julianToJdn(y, m, d)` — same family of algorithm as
Gregorian, just without the Gregorian leap-year correction (no ÷100/÷400
adjustment). Used for the "Julian calendar" display, which some Orthodox
communities use in parallel with the Ethiopian calendar.

## Ethiopian ⇄ JDN

```js
const ETHIOPIAN_JDN_EPOCH = 1724221; // JDN of Meskerem 1, Year 1 (Ethiopian)

function ethiopianToJdn(ey, em, ed) {
    return ETHIOPIAN_JDN_EPOCH + (ey - 1) * 365 + Math.floor(ey / 4) + (em - 1) * 30 + (ed - 1);
}
```

The Ethiopian calendar is simple by design: 12 months of exactly 30 days,
plus a 13th month (Pagumē) of 5 days, or 6 in a leap year. The leap-year
rule is `ey mod 4 === 3` (see `getMonthLength`) — every 4th year, aligned so
that leap years fall the year *before* the Gregorian leap year, which is why
the Ethiopian new year (Meskerem 1) lands on September 11th most years but
September 12th following an Ethiopian leap year.

`jdnToEthiopian(jdn)` reverses this by finding which 4-year (1461-day) cycle
the JDN falls in, then which of the 4 years within that cycle, then the
day-of-year, then month/day via simple division by 30.

## Islamic (Hijri) ⇄ JDN

Uses the standard **tabular Islamic calendar** (also called the "civil" or
"arithmetic" Hijri calendar) — a fixed 30-year cycle with 11 leap years per
cycle (`isIslamicLeap(iy)` checks `(11*iy + 14) mod 30 < 11`), *not* actual
lunar sighting. This is the same approach used by most software Hijri
calendars (Umm al-Qura and sighting-based calendars will differ by a day or
two around month boundaries — this is disclosed to the user via the
`isl_disclaimer` string in the Hijri/Islamic UI).

```
ISLAMIC_EPOCH = 1948440   // JDN of 1 Muharram, AH 1
```

`jdnToIslamic(jdn)` / `islamicToJdn(iy, im, id)` implement the standard
tabular-calendar formulas built on that epoch. Odd months are 30 days, even
months are 29, except month 12 (Dhu al-Hijjah) which gets a 30th day in leap
years.

## Hebrew ⇄ JDN

The most involved conversion, because the Hebrew calendar is a genuine
lunisolar calendar with variable year lengths (353–385 days depending on
leap status and whether the year is "deficient," "regular," or
"complete"). The implementation follows the standard *Molad*-based
algorithm:

- `HEBREW_EPOCH = 347998` — JDN of Hebrew year 1, month 1, day 1.
- `hebrewLeap(year)` — Metonic 19-year cycle leap rule: `(7*year + 1) mod 19 < 7`.
- `hebrewDelay1(year)` / `hebrewDelay2(year)` — the *dehiyyot* (postponement
  rules) that shift Rosh Hashanah to avoid certain weekdays and keep
  adjacent years' lengths valid.
- `hebrewMonthLength(year, month)` — month lengths depend on whether the
  year is leap, and on `isComplete`/`isDeficient` (whether Cheshvan gets 30
  days and/or Kislev loses a day, to keep the total year length in the
  valid 353–385 range).
- `hebrewToJdn` / `jdnToHebrew` walk month-by-month from the year's first
  JDN, same pattern as the Ethiopian conversion.

If you need to touch this function, budget real time for it — lunisolar
calendars have more edge cases than solar ones, and the postponement rules
in particular are easy to get subtly wrong. Test against a reference Hebrew
calendar for at least a couple of the "deficient year" and "leap year"
edge cases before trusting a change here.

## A note on "Ethiopian time"

Separately from calendar conversion, `getAddisSunTimes()` approximates
sunrise/sunset for Addis Ababa with a simple sinusoidal offset model (not a
real solar-position calculation), then converts the result into traditional
**Ethiopian/Kekros time**, where the day starts at what EAT calls 6:00 AM
(12:00 ጠዋት in Ethiopian reckoning) and 6:00 PM becomes 12:00 ማታ. This is a
deliberate approximation for a nice-to-have display, not a value anything
else in the app depends on — if you need real astronomical sunrise/sunset,
replace this function rather than trying to make the calendar-conversion
functions above account for it.
