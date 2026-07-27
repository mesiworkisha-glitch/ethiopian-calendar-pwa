# Bahire Hasab (ባሕረ ሐሳብ)

This document explains how `calculateBahreHasab(ey)` in `app.js` derives the
Ethiopian Orthodox Tewahedo Church's movable feasts and fasting periods for a
given Ethiopian year. It describes the algorithm exactly as implemented, so
it can double as a reference when auditing or porting the logic (as was done
for the Jieshuo/Lua NVDA add-on port).

Bahire Hasab ("Sea of Computation") is the traditional Ge'ez computistical
method for locating Easter (ትንሣኤ, Tensae) and everything whose date depends
on it, without needing an almanac. It's conceptually similar to the
Gregorian *computus*, but with its own epoch, cycle lengths, and terminology.

## Inputs and core numbers

Everything starts from `ey`, the Ethiopian year (`ዓ.ም`, Amete Mihret).

| Term | Amharic | What it is | Formula |
|---|---|---|---|
| `aa` | ዓመተ ዓለም (Amete Alem) | "Year of the World" — the year count in the older Alexandrian era, used as the basis for the 19-year and 7-day cycles | `ey + 5500` |
| `medeb` | መደብ | Position in the 19-year Metonic lunar cycle | `aa mod 19` |
| `wenber` | ወንበር | "The Chair" — one less than `medeb`, wrapping 0→18 | `medeb === 0 ? 18 : medeb - 1` |
| `abekte` | አበቅቴ | Epact-like value: how far the lunar year has drifted from the solar year | `(wenber * 11) mod 30`, treating a `0` result as `30` |
| `metqe` | መጥቅ | Companion value to `abekte`, used to locate Nineveh/Abiy Tsom | `(wenber * 19) mod 30`, treating a `0` result as `30` |
| `wengelawi` | ወንጌላዊ | Which of the 4 evangelists "owns" the year (Matthew/Mark/Luke/John) | `aa mod 4`: `1`→Matthew, `2`→Mark, `3`→Luke, `0`→John |

`wengelawi` and the calendar's leap-year flag are **not** the same condition,
despite both being based on a 4-year cycle — don't conflate them:

- `getMonthLength()` gives Pagumē 6 days (instead of 5) when
  `ey mod 4 === 3`. This is *the* Ethiopian leap year.
- `getFdreHolidays()` separately puts Genna on Tahsas 28 (instead of the
  usual 29) when `ey mod 4 === 0` — i.e. in John's (ዮሐንስ) year, which is the
  year *after* the leap year above. This is real, intentional behavior in
  the source and not a copy-paste of the leap-year check — but the deeper
  traditional-calendar reasoning for why Genna's Ethiopian day-number itself
  shifts (rather than just its Gregorian equivalent drifting) isn't
  something this document is confident explaining further. If you're
  touching this code, verify against a second source before assuming either
  number is "the bug."

## Tinte Qemer (ጥንተ ፀሐይ) and Mebaja Hamer

```
tinteQemerNum = (aa + floor(aa / 4)) mod 7        // 0 = Monday .. 6 = Sunday
tinteQemer    = weekday name for tinteQemerNum
```

`tinteQemer` ("Foundation of the Sun") is the weekday the year's solar cycle
is anchored to. From there:

```
mMonthIdx = metqe > 14 ? 0 : 1                       // which of two anchor months to use
mWeekday  = (tinteQemerNum + mMonthIdx*2 + (metqe-1)) mod 7
```

`mWeekday` is looked up in a fixed table to get **Tewsak** (ተውሳክ, "the
addition"):

```
mebajaHamerTewsak = { 0:6, 1:5, 2:4, 3:3, 4:2, 5:8, 6:7 }[mWeekday]
mebajaHamer       = mebajaHamerTewsak + metqe
```

**Mebaja Hamer** (መባጃ ሐመር, "the key of the ship/ark") is the pivotal number:
every movable feast is calculated as a fixed day-offset from it.

## Locating the movable feasts

```js
base = metqe > 14 ? 5 : 6   // anchor month: 5 = ጥር (Tir), 6 = የካቲት (Yekatit)
```

Each feast is `mebajaHamer + offset` days after the 1st of the anchor month,
rolling over into subsequent Ethiopian months (each 30 days long) as needed:

| Feast (internal key) | Amharic | Offset from Mebaja Hamer |
|---|---|---|
| `nenewe` | ጾመ ነነዌ (Fast of Nineveh) | +0 |
| `abiy` | ዓቢይ ጾም (Great Lent begins) | +14 |
| `debre_zeyit` | ደብረ ዘይት | +41 |
| `hosanna` | ሆሳዕና (Palm Sunday) | +62 |
| `siklet` | ስቅለት (Good Friday) | +67 |
| `tensae` | ትንሣኤ (Easter) | +69 |
| `rikbe_kahnat` | ርክበ ካህናት | +93 |
| `erget` | ዕርገት (Ascension) | +108 |
| `parakletos` | ጰራቅሊጦስ (Pentecost) | +118 |
| `hawaryat` | ጾመ ሐዋርያት (Fast of the Apostles begins) | +119 |
| `dihnet` | ጾመ ድኅነት | +121 |

The rollover logic (`while (d > 30) { d -= 30; mIdx++; }`, wrapping month 14
back to 1) is exactly what `getMonthLength`/`ethiopianDayOfYear` assume
elsewhere in the codebase: **every** Ethiopian month is treated as 30 days
for this arithmetic (the short 13th month, Pagumē, is never landed on by a
movable feast in practice, so this simplification is safe).

## Fixed-date feasts (not part of Bahire Hasab proper)

These are calendar-fixed (same Ethiopian month/day every year) and are
computed separately in `getFdreHolidays()`, not from Mebaja Hamer:

- Enkutatash (New Year) — Meskerem 1
- Meskel — Meskerem 17
- Genna (Christmas) — Tahsas 29, or Tahsas 28 when `ey mod 4 === 0`
- Timkat (Epiphany) — Tir 11
- Adwa Victory Day — Yekatit 23
- Patriots' Victory Day — Miazia 27
- International Labor Day — Gregorian May 1st (fixed to the Gregorian
  calendar, not the Ethiopian one — see `docs/calendar-algorithm.md`)

## Fasting seasons and liturgical zemene

`getSeasons(ey, em, ed, bh)` uses the feast day-numbers above (converted to
"day of Ethiopian year" via `ethiopianDayOfYear`) to classify any given date
into:

- **`fasting`** — one of: no fast, Abiy Tsom (Great Lent), Tsome Nebiyat
  (Advent, a *fixed* Meskerem 26–Tahsas 8 style range independent of Bahire
  Hasab — see the hardcoded `75..118` day-range in the source), Filseta,
  Tsome Hawaryat, Tsome Nenewe, Gehad (Holy Saturday), Hamsa Elet (the 50
  days of Easter joy, when fasting is suspended), or the ordinary
  Wednesday/Friday fast.
- **`liturgical`** — one of the ~30 named *zemene* (ዘመነ) periods of the
  liturgical year (Zemene Yohannes, Zemene Meskel, Zemene Tsige, Zemene
  Astemhro, Zemene Sibket, Zemene Birhan, Zemene Lidet, Zemene Timket, Zemene
  Nenewe, Zemene Tsom, Zemene Tensae, Zemene Erget, Zemene Perakletos, and
  several late-year `ዘመነ` blocks). See `getLiturgicalSeason()` for the exact
  day-number boundaries.
- **`climatic`** — the four Ethiopian seasons (Kharfo/Autumn,
  Kiremt/Summer... — see the `season_*` i18n keys), based purely on
  day-of-year, unrelated to Bahire Hasab.

## Known simplification (documented, not a bug)

The 19-year cycle used here (`medeb`/`wenber`) is the traditional Ge'ez
Metonic approximation, not a modern astronomical lunar calculation — this is
intentional and matches the EOTC's own computus, not an approximation error
to "fix." If you're comparing output against a real wall calendar and see a
1-day difference around a fast boundary, check whether the calendar you're
comparing against uses the same traditional method before assuming this
implementation is wrong.
