/* ── Bible Cross-Reference Module (80-weahadu.json) ─────────────────────── */
(function (root) {
    'use strict';

    let bibleData = null;
    let bibleByNumber = null;
    let loadPromise = null;
    let corrections = null;
    let correctionsPromise = null;

    async function loadBible() {
        if (bibleData) return bibleData;
        if (loadPromise) return loadPromise;

        loadPromise = (async () => {
            try {
                const res = await fetch('80-weahadu.json');
                bibleData = await res.json();
                bibleByNumber = new Map();
                bibleData.forEach(b => bibleByNumber.set(b.book_number, b));
                return bibleData;
            } catch (err) {
                console.error('Failed to load Bible dataset:', err);
                loadPromise = null;
                throw err;
            }
        })();

        return loadPromise;
    }

    async function loadCorrections() {
        if (corrections) return corrections;
        if (correctionsPromise) return correctionsPromise;

        correctionsPromise = (async () => {
            try {
                const res = await fetch('gitsawe-corrections.json');
                corrections = await res.json();
                return corrections;
            } catch (err) {
                corrections = {};
                return corrections;
            }
        })();

        return correctionsPromise;
    }

    const GEEZ_VALUES = {
        '፩': 1, '፪': 2, '፫': 3, '፬': 4, '፭': 5, '፮': 6, '፯': 7, '፰': 8, '፱': 9,
        '፲': 10, '፳': 20, '፴': 30, '፵': 40, '፶': 50, '፷': 60, '፸': 70, '፹': 80, '፺': 90,
        '፻': 100, '፼': 10000
    };

    function geezToNumber(s) {
        if (!s) return null;
        let total = 0;
        let current = 0;
        for (const ch of s) {
            const v = GEEZ_VALUES[ch];
            if (v === undefined) continue;
            if (v >= 100) {
                if (current === 0) current = 1;
                current *= v;
                total += current;
                current = 0;
            } else {
                current += v;
            }
        }
        total += current;
        return total > 0 ? total : null;
    }

    const GEEZ_RUN = '[\u1369-\u137C]+';
    const CV_RE = new RegExp(
        '(?:ም[^\u1369-\u137C]*)?(' + GEEZ_RUN + ')[^\u1369-\u137Cቍ]*ቍ[^\u1369-\u137Cፍ]*(' + GEEZ_RUN + ')' +
        '(?:[\\s\\-\u2013\u2014\u2212.\u2027]*(' + GEEZ_RUN + '|ፍ\\S*))?'
    );

    function parseChapterVerse(s) {
        if (!s) return null;
        const m = CV_RE.exec(s);
        if (!m) return null;
        const chapter = geezToNumber(m[1]);
        const vstart = geezToNumber(m[2]);
        if (vstart === null) return null;
        let vend;
        if (!m[3]) vend = vstart;
        else if (m[3].charAt(0) === 'ፍ') vend = 'END';
        else vend = geezToNumber(m[3]);
        return { chapter, vstart, vend };
    }

    const JUNK_RE = /[·፡.,\-\u2013\u2014\u2027‧\s]+/g;
    const GEEZ_ORD = { '፩': 1, '፪': 2, '፫': 3 };

    const ROOT_TABLE = [
        [['መዝ', 'መዝሙር'], 28],
        [['ማቴ'], 55],
        [['ማር'], 56],
        [['ሉቃ'], 57],
        [['ሮሜ'], 60],
        [['ገላ', 'ጌላ'], 63],
        [['ኤፌ', 'ፌሶን'], 64],
        [['ፊልጵ', 'ፈልጽስ'], 65],
        [['ፊልሞ'], 72],
        [['ቆላ', 'ቈላ', 'ቴላስይስ', 'ቄላስይስ'], 66],
        [['ቲቶ'], 71],
        [['ዕብራ', 'ዕብ'], 73],
        [['ያዕ'], 79],
        [['ይሁዳ'], 80],
        [['ሐዋ'], 59],
        [['ራእ', 'ራዕየ'], 81]
    ];

    const ROOT_TABLE_ORDINAL = {
        'ቆሮ': { 1: 61, 2: 62 },
        'ተሰ': { 1: 67, 2: 68 },
        'ተሰሎ': { 1: 67, 2: 68 },
        'ተሰሎን': { 1: 67, 2: 68 },
        'ጢሞ': { 1: 69, 2: 70 },
        'ጴጥ': { 1: 74, 2: 75 },
        'ጴጥሮ': { 1: 74, 2: 75 },
        'ጴጥር': { 1: 74, 2: 75 },
        'ጴጥሮስ': { 1: 74, 2: 75 },
        'ዮሐ': { gospel: 58, 1: 76, 2: 77, 3: 78 },
        'ዮሐን': { 1: 76, 2: 77, 3: 78 },
        'ዮሐንስ': { gospel: 58, 1: 76, 2: 77, 3: 78 }
    };

    function normalizeBookToken(tok) {
        if (!tok) return { root: null, ordinal: null };
        let t = tok.replace(JUNK_RE, ' ').trim();
        let parts = t.split(' ').filter(Boolean);
        let changed = true;
        while (changed && parts.length) {
            changed = false;
            if (parts[0] === 'ዓዲ') { parts = parts.slice(1); changed = true; }
            if (parts.length > 1 && (parts[0] === 'ግብረ' || parts[0] === 'ግብ') && (parts[1] === 'ሐዋ' || parts[1] === 'ሐዋርያት')) {
                parts = ['ሐዋ'].concat(parts.slice(2)); changed = true;
            }
            if (parts[0] === 'ዘቅዳሴ') { parts = parts.slice(1); changed = true; }
        }
        if (!parts.length) return { root: null, ordinal: null };
        let ordinal = null;
        const rootTokens = [];
        parts.forEach(p => {
            if (GEEZ_ORD[p] !== undefined) ordinal = GEEZ_ORD[p];
            else if (p === '1' || p === '2' || p === '3') ordinal = parseInt(p, 10);
            else rootTokens.push(p);
        });
        let root = rootTokens.length ? rootTokens[0] : null;
        if (root && root.charAt(0) === 'ዘ' && root.length > 3) root = root.slice(1);
        return { root, ordinal };
    }

    function resolveBook(tok, context) {
        const { root, ordinal } = normalizeBookToken(tok);
        if (!root) return null;
        for (const [roots, bn] of ROOT_TABLE) {
            for (const r of roots) {
                if (root.indexOf(r) === 0 || r.indexOf(root) === 0) return bn;
            }
        }
        for (const r in ROOT_TABLE_ORDINAL) {
            if (root.indexOf(r) === 0 || r.indexOf(root) === 0) {
                const table = ROOT_TABLE_ORDINAL[r];
                if (ordinal !== null && table[ordinal] !== undefined) return table[ordinal];
                if (context === 'gospel' && table.gospel !== undefined) return table.gospel;
                return null;
            }
        }
        return null;
    }

    function getVerses(bookNumber, chapter, vstart, vend) {
        if (!bibleByNumber) return null;
        const book = bibleByNumber.get(bookNumber);
        if (!book || !chapter) return null;
        const chapterObj = book.chapters.find(c => c.chapter === chapter);
        if (!chapterObj) return null;
        const allVerses = [];
        chapterObj.sections.forEach(sec => {
            (sec.verses || []).forEach(v => allVerses.push(v));
        });
        const end = vend === 'END' ? Infinity : (vend || vstart);
        const matched = allVerses.filter(v => v.verse >= vstart && v.verse <= end);
        if (!matched.length) return null;
        return {
            book_name_am: book.book_name_am,
            book_short_name_am: book.book_short_name_am,
            chapter,
            verses: matched
        };
    }

    function resolveAndFetch(bookToken, chapterVerseStr, context, ref) {
        const cv = parseChapterVerse(chapterVerseStr);
        const masterBn = resolveBook(bookToken, context);
        const masterOk = !!(cv && cv.chapter && masterBn);

        if (ref && corrections) {
            const key = `${ref.month}-${ref.day}-${ref.slot}-${ref.role}`;
            const c = corrections[key];
            if (c && (!masterOk || (masterBn === c.bn && cv.chapter === c.sc))) {
                const result = getVerses(c.bn, c.sc, c.sv, c.sc === c.ec ? c.ev : 'END');
                if (result) return Object.assign({ corrected: true }, result);
            }
        }

        if (!masterOk) return null;
        return getVerses(masterBn, cv.chapter, cv.vstart, cv.vend);
    }

    root.EthioBible = {
        loadBible,
        loadCorrections,
        geezToNumber,
        parseChapterVerse,
        resolveBook,
        getVerses,
        resolveAndFetch,
        getBookByNumber: n => bibleByNumber ? bibleByNumber.get(n) : null
    };
})(typeof window !== 'undefined' ? window : globalThis);
