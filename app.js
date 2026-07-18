// Global Constants & Mapping Arrays
const MONTHS = ["", "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት", "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"];
const WEEKDAYS = ["እሁድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ"];
const ISLAMIC_MONTHS = ["", "ሙሐረም", "ሰፈር", "ረቢዑል አወል", "ረቢዑል ሳኒ", "ጀማደል አወል", "ጀማደል ሳኒ", "ረጀብ", "ሻእባን", "ረመዳን", "ሸዋል", "ዙልቂዳህ", "ዙልሒጃህ"];
const ENGLISH_MONTHS = ["", "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit", "Megabit", "Miazia", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume"];
const ISLAMIC_EPOCH = 1948440;

// Amharic Homophone Normalizer Engine
const AMHARIC_HOMOPHONE_MAP = {};
const AMHARIC_GROUPS = [["ሀሁሂሃሄህሆ", "ሐሑሒሓሔሕሖ", "ኀኁኂኃኄኅኆ"], ["ሰሱሲሳሴስሶ", "ሠሡሢሣሤሥሦ"], ["አኡኢኣኤእኦ", "ዐዑዒዓዔዕዖ"], ["ጸጹጺጻጼጽጾ", "ፀፁፂፃፄፅፆ"]];
AMHARIC_GROUPS.forEach(g => {
    let canonical = g[0];
    g.slice(1).forEach(row => {
        for(let i=0; i<canonical.length; i++) AMHARIC_HOMOPHONE_MAP[row[i]] = canonical[i];
    });
});
function normalizeAmharic(text) {
    return Array.from(text || "").map(ch => AMHARIC_HOMOPHONE_MAP[ch] || ch).join("");
}

// Complex Month Parsing Dictionary Aliases
const MONTH_ALIASES = {
    3: ["ህዳር", "ሕዳር", "hedar"], 4: ["ታህሳስ", "ታሕሳስ", "tahesas", "tachesas"],
    11: ["ሃምሌ", "ኃምሌ", "hamlie"], 12: ["ነሃሴ", "ነኃሴ", "nehasse"],
    13: ["ጳጐሜ", "ጳጎሜ", "ጳጉሜን", "pagumen", "paguemen"]
};

function matchMonthName(text) {
    let raw = (text || "").trim().toLowerCase();
    if (raw.length < 2) return null;
    let normAm = normalizeAmharic(raw);
    for (let idx = 1; idx <= 13; idx++) {
        let targets = [MONTHS[idx], ENGLISH_MONTHS[idx]].map(t => t.toLowerCase());
        if (MONTH_ALIASES[idx]) targets = targets.concat(MONTH_ALIASES[idx].map(a => a.toLowerCase()));
        for (let target of targets) {
            let normT = normalizeAmharic(target);
            if (normT === normAm || normT.startsWith(normAm) || normAm.startsWith(normT)) return idx;
        }
    }
    return null;
}

// Core Math Foundations (Julian Day Calculations)
function ethiopianToJdn(ey, em, ed) { return 1724221 + (ey - 1) * 365 + Math.floor(ey / 4) + (em - 1) * 30 + (ed - 1); }
function gregorianToJdn(gy, gm, gd) {
    let a = Math.floor((14 - gm) / 12), y = gy + 4800 - a, m = gm + 12 * a - 3;
    return gd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}
function jdnToEthiopian(jdn) {
    let r = jdn - 1724221, cycles = Math.floor(r / 1461), rem = r % 1461;
    let yCycle = rem < 365 ? 0 : rem < 730 ? 1 : rem < 1096 ? 2 : 3;
    let dYear = yCycle === 0 ? rem : yCycle === 1 ? rem - 365 : yCycle === 2 ? rem - 730 : rem - 1096;
    return { ey: cycles * 4 + yCycle + 1, em: Math.floor(dYear / 30) + 1, ed: (dYear % 30) + 1 };
}
function jdnToGregorian(jdn) {
    let l = jdn + 68569, n = Math.floor((4 * l) / 146097); l -= Math.floor((146097 * n + 3) / 4);
    let i = Math.floor((4000 * (l + 1)) / 1461001); l = l - Math.floor((1461 * i) / 4) + 31;
    let j = Math.floor((80 * l) / 2447); let d = l - Math.floor((2447 * j) / 80); l = Math.floor(j / 11);
    let m = j + 2 - 12 * l, y = 100 * (n - 49) + i + l; return new Date(y, m - 1, d);
}
function ethToGregorian(ey, em, ed) { return jdnToGregorian(ethiopianToJdn(ey, em, ed)); }
function gregorianToEthiopian(gy, gm, gd) { return jdnToEthiopian(gregorianToJdn(gy, gm, gd)); }
function getMonthLength(ey, em) { return em === 13 ? (ey % 4 === 3 ? 6 : 5) : 30; }

// Islamic Calendar Engines
function jdnToIslamic(jdn) {
    let l = jdn - ISLAMIC_EPOCH + 10632, n = Math.floor((l - 1) / 10631); l = l - 10631 * n + 354;
    let j = (Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670) * Math.floor((43 * l) / 15238));
    l = l - (Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)) - (Math.floor(j / 16) * Math.floor((15238 * j) / 43)) + 29;
    let im = Math.floor((24 * l) / 709), id = l - Math.floor((709 * im) / 24), iy = 30 * n + j - 30;
    return { iy, im, id };
}
function islamicToJdn(iy, im, id) { return Math.floor(id + Math.floor((59 * (im - 1) + 1) / 2) + (iy - 1) * 354 + Math.floor((3 + 11 * iy) / 30) + ISLAMIC_EPOCH - 1); }
function isIslamicLeap(iy) { return (11 * iy + 14) % 30 < 11; }
function getIslamicMonthLength(iy, im) { return im === 12 ? (isIslamicLeap(iy) ? 30 : 29) : (im % 2 === 1 ? 30 : 29); }
function getIslamicEvents(im, id) {
    let ev = [];
    if (im === 1 && id === 10) ev.push("ዓሹራ (Ashura)"); if (im === 3 && id === 12) ev.push("መውሊድ (Mawlid)");
    if (im === 7 && id === 27) ev.push("እስራ ወሚዕራጅ (Isra and Mi'raj)");
    if (im === 9) { ev.push("ረመዳን (Ramadan)"); if (id >= 21) ev.push("የረመዳን መጨረሻዎቹ 10 ቀናት (Laylat al‑Qadr)"); }
    if (im === 10 && id === 1) ev.push("ዒድ አልፊጥር (Eid al-Fitr)");
    if (im === 12) { if (id === 9) ev.push("የዐረፋ ቀን (Day of Arafah)"); if (id === 10) ev.push("ዒድ አልአድሐ (Eid al-Adha)"); if (id <= 10) ev.push("የሐጅ ወቅት (Hajj season)"); }
    return ev;
}

// Zodiac Computations
function getZodiacSign(m, d) {
    const signs = [[1,20,"ካፕሪኮርን ♑","አኳሪየስ ♒"],[2,19,"አኳሪየስ ♒","ፓይሰስ ♓"],[3,21,"ፓይሰስ ♓","አሪየስ ♈"],[4,20,"አሪየስ ♈","ታውረስ ♉"],[5,21,"ታውረስ ♉","ጀሚናይ ♊"],[6,21,"ጀሚናይ ♊","ካንሰር ♋"],[7,23,"ካንሰር ♋","ሊዮ ♌"],[8,23,"ሊዮ ♌","ቨርጎ ♍"],[9,23,"ቨርጎ ♍","ሊብራ ♎"],[10,23,"ሊብራ ♎","ስኮርፒዮ ♏"],[11,22,"ስኮርፒዮ ♏","ሳጂታሪየስ ♐"],[12,22,"ሳጂታሪየስ ♐","ካፕሪኮርን ♑"]];
    return d < signs[m-1][1] ? signs[m-1][2] : signs[m-1][3];
}
function getAwdeNegestSign(m, d) {
    const signs = [[1,20,"ጀዲ (መሬት) — ንስር","ደለዊ (ነፋስ) — በሬ"],[2,19,"ደለዊ (ነፋስ) — በሬ","ሑት (ውሃ) — ከይሲ"],[3,21,"ሑት (ውሃ) — ከይሲ","ሐመል (እሳት) — ድብ"],[4,20,"ሐመል (እሳት) — ድብ","ሠውር (መሬት) — ዝንጀሮ"],[5,21,"ሠውር (መሬት) — ዝንጀሮ","ገውዝ (ነፋስ) — ዓጋዘን"],[6,21,"ገውዝ (ነፋስ) — ዓጋዘን","ሸርጣን (ውሃ) — ቀበሮ"],[7,23,"ሸርጣን (ውሃ) — ቀበሮ","አሰድ (እሳት) — አንበሳ"],[8,23,"አሰድ (እሳት) — አንበሳ","ሰንቡላ (መሬት) — ጉጉት"],[9,23,"ሰንቡላ (መሬት) — ጉጉት","ሚዛን (ነፋስ) — ተኩላ"],[10,23,"ሚዛን (ነፋስ) — ተኩላ","ዓቅራብ (ውሃ) — ነብር"],[11,22,"ዓቅራብ (ውሃ) — ነብር","ቀውስ (እሳት) — ጅብ"],[12,22,"ቀውስ (እሳት) — ጅብ","ጀዲ (መሬት) — ንስር"]];
    return d < signs[m-1][1] ? signs[m-1][2] : signs[m-1][3];
}

// Bahre Hasab Calendar Logic Core (Upgraded)
function calculateBahreHasab(ey) {
    let aa = ey + 5500;
    let medeb = aa % 19;
    let wenber = medeb === 0 ? 18 : medeb - 1;
    let abekte = (wenber * 11) % 30 || 30;
    let metqe = (wenber * 19) % 30 || 30;
    let tinteQemerNum = (aa + Math.floor(aa / 4)) % 7;
    let tinteQemer = ["ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ", "እሁድ"][tinteQemerNum];
    
    let mMonthIdx = metqe > 14 ? 0 : 1;
    let mWeekday = (tinteQemerNum + (mMonthIdx * 2) + (metqe - 1)) % 7;
    let mebajaHamerTewsak = {0:6, 1:5, 2:4, 3:3, 4:2, 5:8, 6:7}[mWeekday];
    let mebajaHamer = mebajaHamerTewsak + metqe;
    
    let feasts = {};
    let base = metqe > 14 ? 5 : 6;
    [["ጾመ ነነዌ",0], ["ዐቢይ ጾም",14], ["ደብረ ዘይት",41], ["ሆሳዕና",62], ["ስቅለት",67], ["ትንሣኤ",69], ["ርክበ ካህናት",93], ["ዕርገት",108], ["ጰራቅሊጦስ",118], ["ጾመ ሐዋርያት",119], ["ጾመ ድኅነት",121]].forEach(([name, offset]) => {
        let tot = mebajaHamer + offset, mIdx = base, d = tot;
        while(d > 30) { d -= 30; mIdx++; }
        if(mIdx > 13) mIdx -= 13;
        feasts[name] = { m: mIdx, d: d };
    });
    
    return { aa, wengelawi: {1:'ማቴዎስ', 2:'ማርቆስ', 3:'ሉቃስ', 0:'ዮሐንስ'}[aa % 4], medeb, wenber, metqe, abekte, tinteQemer, mebajaHamer, mebajaHamerTewsak, feasts };
}

// Seasons, Liturgical Timelines and Fasting Progress
function getSeasons(ey, em, ed, bh) {
    let dayNum = (em - 1) * 30 + ed;
    let climatic = dayNum >= 26 && dayNum <= 115 ? "መፀው" : dayNum >= 116 && dayNum <= 205 ? "በጋ" : dayNum >= 206 && dayNum <= 295 ? "በልግ" : "ክረምት";
    
    let fNenewe = (bh.feasts["ጾመ ነነዌ"].m - 1) * 30 + bh.feasts["ጾመ ነነዌ"].d;
    let fAbiy = (bh.feasts["ዐቢይ ጾም"].m - 1) * 30 + bh.feasts["ዐቢይ ጾም"].d;
    let fHosanna = (bh.feasts["ሆሳዕና"].m - 1) * 30 + bh.feasts["ሆሳዕና"].d;
    let fTensae = (bh.feasts["ትንሣኤ"].m - 1) * 30 + bh.feasts["ትንሣኤ"].d;
    let fHawariat = (bh.feasts["ጾመ ሐዋርያት"].m - 1) * 30 + bh.feasts["ጾመ ሐዋርያት"].d;
    let fPentecost = (bh.feasts["ጰራቅሊጦስ"].m - 1) * 30 + bh.feasts["ጰራቅሊጦስ"].d;

    let fasting = "የአጽዋም ዘመን አይደለም";
    if (dayNum >= fAbiy && dayNum < fTensae) fasting = "ዐቢይ ጾም";
    else if (dayNum >= 75 && dayNum <= 118) fasting = "ጾመ ነቢያት";
    else if (dayNum >= 331 && dayNum <= 345) fasting = "ጾመ ፍልሰታ";
    else if (dayNum >= fHawariat && dayNum <= 305) fasting = "ጾመ ሐዋርያት";
    else if (dayNum >= fNenewe && dayNum < fNenewe + 3) fasting = "ጾመ ነነዌ";
    else if (dayNum === 130) fasting = "ጾመ ገሀድ (የጥምቀት ዋዜማ)";
    else if (dayNum >= fTensae && dayNum <= fPentecost) fasting = "የአጽዋም ዘመን አይደለም (ኀምሳ ዕለት)";
    else {
        let wd = ethToGregorian(ey, em, ed).getDay();
        if ((wd === 3 || wd === 5) && dayNum !== 119 && dayNum !== 131) fasting = "ጾመ ድኅነት (ረቡዕ እና ዓርብ ጾም)";
    }

    let liturgical = "ዘመነ ክረምት";
    if (dayNum >= 1 && dayNum <= 16) liturgical = "ዘመነ ዮሐንስ";
    else if (dayNum >= 17 && dayNum <= 25) liturgical = "ዘመነ መስቀል";
    else if (dayNum >= 26 && dayNum <= 65) liturgical = "ዘመነ ጽጌ";
    else if (dayNum >= 66 && dayNum <= 74) liturgical = "ዘመነ አስተምህሮ";
    else if (dayNum >= 75 && dayNum <= 118) liturgical = "ዘመነ ስብከት (የነቢያት ጾም)";
    else if (dayNum >= 119 && dayNum <= 130) liturgical = "ዘመነ አሥተርእዮ (ልደት)";
    else if (dayNum >= 131 && dayNum < fNenewe) liturgical = "ዘመነ ጥምቀት";
    else if (dayNum >= fNenewe && dayNum < fAbiy) liturgical = "ዘመነ ነነዌ";
    else if (dayNum >= fAbiy && dayNum < fHosanna) liturgical = "ዘመነ ዐቢይ ጾም";
    else if (dayNum >= fHosanna && dayNum < fTensae) liturgical = "ሰሙነ ሕማማት";
    else if (dayNum >= fTensae && dayNum <= fPentecost) liturgical = "ዘመነ ትንሣኤ (ኀምሳ ዕለት)";
    else if (dayNum > fPentecost && dayNum <= 305) liturgical = "ዘመነ ሐዋርያት / ጰራቅሊጦስ";
    else if (dayNum >= 306 && dayNum <= 345) liturgical = "ዘመነ ክረምት (ፍልሰታ)";

    let progress = "";
    let ranges = [
        {n: "ጾመ ነነዌ", s: fNenewe, l: 3},
        {n: "ዐቢይ ጾም", s: fAbiy, l: fTensae - fAbiy},
        {n: "ጾመ ነቢያት", s: 75, l: 44},
        {n: "ጾመ ሐዋርያት", s: fHawariat, l: 305 - fHawariat + 1},
        {n: "ጾመ ፍልሰታ", s: 331, l: 15}
    ];
    for (let r of ranges) {
        if (dayNum >= r.s && dayNum < r.s + r.l) {
            progress = `በአሁኑ ሰዓት በ${r.n} ውስጥ ነዎት፤ ቀን ${dayNum - r.s + 1} ከ ${r.l}።`;
            break;
        }
    }

    return { climatic, fasting, liturgical, progress };
}

function getUpcomingEvents(ey, em, ed, bh) {
    let todayNum = (em - 1) * 30 + ed;
    let events = [];
    
    [[1,"እንቁጣጣሽ (አዲስ ዓመት)"], [17,"የመስቀል በዓል"], [75,"ጾመ ነቢያት ይጀምራል"], 
     [130,"ጾመ ገሀድ"], [131,"ጥምቀት"], [331,"ጾመ ፍልሰታ ይጀምራል"], [345,"ፍልሰታ ለማርያም"]].forEach(e => events.push(e));
    events.push([ey % 4 === 0 ? 118 : 119, "ገና (ልደት)"]);

    for (const [name, dateObj] of Object.entries(bh.feasts)) {
        events.push([(dateObj.m - 1) * 30 + dateObj.d, name]);
    }

    events.sort((a,b) => a[0] - b[0]);
    for (let i = 0; i < events.length; i++) {
        if (events[i][0] > todayNum) {
            let daysLeft = events[i][0] - todayNum;
            let targetEm = Math.floor((events[i][0] - 1) / 30) + 1;
            let targetEd = ((events[i][0] - 1) % 30) + 1;
            return `ቀጣዩ በዓል/ጾም፦ ${events[i][1]} (${MONTHS[targetEm]} ${targetEd}) — በ${daysLeft} ቀናት ውስጥ`;
        }
    }
    return "በዚህ ዓመት ቀጣይ የተመዘገበ በዓል የለም።";
}

// Public National FDRE Holidays Engine
function getFdreHolidays(ey) {
    let startG = ethToGregorian(ey, 1, 1), yearG = startG.getFullYear();
    let bh = calculateBahreHasab(ey);
    let gennaDay = ey % 4 === 0 ? 28 : 29;
    
    let h = [
        { n: "እንቁጣጣሽ (አዲስ ዓመት)", g: startG, c: true },
        { n: "የመስቀል በዓል", g: ethToGregorian(ey, 1, 17), c: true },
        { n: "የብሔሮች፣ ብሔረሰቦችና ሕዝቦች ቀን", g: ethToGregorian(ey, 3, 29), c: false },
        { n: "ገና (ልደት)", g: ethToGregorian(ey, 4, gennaDay), c: true },
        { n: "ጥምቀት", g: ethToGregorian(ey, 5, 11), c: true },
        { n: "የዓድዋ ድል በዓል", g: ethToGregorian(ey, 6, 23), c: true },
        { n: "የሰማዕታት መታሰቢያ ቀን", g: ethToGregorian(ey, 6, 12), c: false },
        { n: "የአርበኞች ድል በዓል", g: ethToGregorian(ey, 8, 27), c: true },
        { n: "የዓለም የሠራተኞች ቀን", g: new Date(yearG + 1, 4, 1), c: true },
        { n: "ስቅለት", g: ethToGregorian(ey, bh.feasts["ስቅለት"].m, bh.feasts["ስቅለት"].d), c: true },
        { n: "ትንሣኤ (ፋሲካ)", g: ethToGregorian(ey, bh.feasts["ትንሣኤ"].m, bh.feasts["ትንሣኤ"].d), c: true }
    ];

    let endG = ethToGregorian(ey + 1, 1, 1);
    let startJ = gregorianToJdn(startG.getFullYear(), startG.getMonth()+1, startG.getDate());
    let endJ = gregorianToJdn(endG.getFullYear(), endG.getMonth()+1, endG.getDate());
    let hStart = jdnToIslamic(startJ).iy, hEnd = jdnToIslamic(endJ).iy;

    for (let y = hStart - 1; y <= hEnd + 1; y++) {
        [[3,12,"መውሊድ"],[10,1,"ዒድ አልፈጥር"],[12,10,"ዒድ አልአድሐ (አረፋ)"]].forEach(([m,d,name]) => {
            let j = islamicToJdn(y, m, d);
            if (j >= startJ && j <= endJ) h.push({ n: name, g: jdnToGregorian(j), c: true, note: "ቀኑ ሂሳባዊ ነው" });
        });
    }
    return h.sort((a,b) => a.g - b.g);
}

// Synaxarium Database Request
let synaxariumData = null;
async function loadSynaxarium() {
    if (synaxariumData) return synaxariumData;
    try {
        let res = await fetch('synaxarium_feasts.json');
        synaxariumData = await res.json();
    } catch(e) { synaxariumData = {}; }
    return synaxariumData;
}

// Safe Initializer Wrapper Loop
document.addEventListener('DOMContentLoaded', () => {
    const modules = [
        { name: "Tabs Control", func: setupTabs },
        { name: "Live Clock", func: initClock },
        { name: "Today View", func: renderToday },
        { name: "Holidays View", func: renderHolidays },
        { name: "Islamic View", func: renderIslamic },
        { name: "Converter Form", func: setupConverter },
        { name: "Synaxarium Search", func: setupSynaxarium },
        { name: "Menstrual Tracker", func: setupPeriodic }
    ];

    modules.forEach(m => {
        try {
            m.func();
        } catch (err) {
            console.error(`Error loading module [${m.name}]:`, err);
        }
    });
});

// Single Page View Router (Resilient Event Listeners)
function setupTabs() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            let targetId = btn.getAttribute('data-target') || btn.dataset.target;
            if (!targetId) return;

            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

            btn.classList.add('active');
            let contentTab = document.getElementById(targetId);
            if (contentTab) contentTab.classList.add('active');
        });
    });
}

// Clock Execution Node
function initClock() {
    const timeBar = document.getElementById('local-time-bar');
    if (!timeBar) return;
    setInterval(() => {
        let now = new Date(), hr = now.getHours(), min = now.getMinutes(), sec = now.getSeconds();
        let ethHr = (hr - 6) % 12; if (ethHr <= 0) ethHr += 12;
        let period = hr < 6 ? "ሌሊት" : hr < 12 ? "ጠዋት" : hr < 18 ? "ከሰዓት በኋላ" : "ማታ";
        
        let dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
        if (now < dayStart) dayStart.setDate(dayStart.getDate() - 1);
        let elapsed = Math.floor((now - dayStart) / 1000);
        let kekros = Math.floor(elapsed / 1440), kaelit = Math.floor((elapsed % 1440) / 24);

        timeBar.innerText = `የኢትዮጵያ ሰዓት፦ ${ethHr}:${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')} ${period} | ኬክሮስ፦ ${kekros} ከ${kaelit} ካልዒት`;
    }, 1000);
}

// Render Summary Modules (Upgraded with Bahre Hasab & Split Synaxarium Logic)
async function renderToday() {
    const container = document.getElementById('today-summary');
    if (!container) return;
    let now = new Date(), eth = gregorianToEthiopian(now.getFullYear(), now.getMonth()+1, now.getDate());
    let bh = calculateBahreHasab(eth.ey), seasons = getSeasons(eth.ey, eth.em, eth.ed, bh);
    let upcoming = getUpcomingEvents(eth.ey, eth.em, eth.ed, bh);
    let chereka = (bh.abekte + (eth.em - 1) + eth.ed) % 30 || 30;
    
    let html = `<p class="large-date"><strong>ዛሬ ${WEEKDAYS[now.getDay()]}፣ ${MONTHS[eth.em]} ${eth.ed} ቀን ${eth.ey} ዓ.ም</strong></p>
    <ul>
        <li><strong>የግሪጎሪያን ቀን፦</strong> ${now.toISOString().split('T')[0]}</li>
        <li><strong>ዘመነ ወንጌላዊ፦</strong> ዘመነ ${bh.wengelawi} (ዓመተ ዓለም ${bh.aa})</li>
        <li><strong>የባሕረ ሐሳብ መረጃ፦</strong> መደብ: ${bh.medeb} | ወንበር: ${bh.wenber} | ጥንተ ቀመር: ${bh.tinteQemer} | ተውሳክ: ${bh.mebajaHamerTewsak}</li>
        <li><strong>የአጽዋም መለኪያ፦</strong> መጥቅዕ: ${bh.metqe} | አበቅቴ: ${bh.abekte} | መባጃ ሐመር: ${bh.mebajaHamer}</li>
        <li><strong>ወቅትና ቤተክርስቲያን፦</strong> ${seasons.climatic} | ${seasons.liturgical}</li>
        <li><strong>የአጽዋም ዘመን፦</strong> ${seasons.fasting} ${seasons.progress ? "<br><em>" + seasons.progress + "</em>" : ""}</li>
        <li><strong>ሰርቀ ጨረቃ፦</strong> ${chereka}</li>
        <li><strong>ኮከብ (Zodiac)፦</strong> ${getZodiacSign(now.getMonth()+1, now.getDate())}</li>
        <li><strong>ዓውደ ነገሥት፦</strong> ${getAwdeNegestSign(now.getMonth()+1, now.getDate())}</li>
    </ul>
    <p style="background:rgba(0,102,204,0.1); padding:10px; border-left:4px solid #0066cc;"><strong>${upcoming}</strong></p>`;

    let data = await loadSynaxarium();
    let entries = (data[MONTHS[eth.em]] && data[MONTHS[eth.em]][eth.ed]) || [];
    
    if (entries.length > 0) {
        let annualFeasts = entries.filter(e => !e.startsWith("ወርኃዊ በዓል፦ "));
        let monthlyFeasts = entries.filter(e => e.startsWith("ወርኃዊ በዓል፦ ")).map(e => e.replace("ወርኃዊ በዓል፦ ", ""));

        html += `<h3>የዕለቱ ስንክሳር በዓላት</h3>`;
        if (annualFeasts.length > 0) {
            html += `<h4>ዓመታዊ በዓላት</h4><ul>` + annualFeasts.map(e => `<li>${e}</li>`).join('') + `</ul>`;
        }
        if (monthlyFeasts.length > 0) {
            html += `<h4>ወርኃዊ በዓላት</h4><ul>` + monthlyFeasts.map(e => `<li>${e}</li>`).join('') + `</ul>`;
        }
    } else {
        html += `<p>ለዕለቱ የተመዘገበ የስንክሳር በዓል የለም።</p>`;
    }

    container.innerHTML = html;
}

function renderHolidays() {
    const container = document.getElementById('holidays-output');
    if (!container) return;
    let now = new Date(), eth = gregorianToEthiopian(now.getFullYear(), now.getMonth()+1, now.getDate());
    let list = getFdreHolidays(eth.ey);
    let html = `<ul>` + list.map(item => {
        let e = gregorianToEthiopian(item.g.getFullYear(), item.g.getMonth()+1, item.g.getDate());
        return `<li><strong>${item.n}</strong> — ${WEEKDAYS[item.g.getDay()]}፣ ${MONTHS[e.em]} ${e.ed} (${item.g.toISOString().split('T')[0]}) [${item.c ? 'ተቋማት ይዘጋሉ':'ተቋማት ክፍት ናቸው'}]</li>`;
    }).join('') + `</ul>`;
    container.innerHTML = html;
}

function renderIslamic() {
    const container = document.getElementById('islamic-summary');
    if (!container) return;
    let now = new Date(), jdn = gregorianToJdn(now.getFullYear(), now.getMonth()+1, now.getDate());
    let isl = jdnToIslamic(jdn), ev = getIslamicEvents(isl.im, isl.id);
    let html = `<p class="large-date"><strong>ዛሬ ${WEEKDAYS[now.getDay()]}፣ ${ISLAMIC_MONTHS[isl.im]} ${isl.id} ቀን ${isl.iy} ዓ.ሂ (Tabular Hijri)</strong></p>
    <p>ወቅታዊ ሁኔታ፦ ${ev.length ? ev.join('፣ '):'የተለየ የጾም ወይም የበዓል ወቅት አይደለም።'}</p>
    <p><small><em>ማሳሰቢያ፦ ይህ በሒሳብ ስሌት ላይ የተመሠረተ ሲሆን ከእውነተኛ የጨረቃ ምልከታ ጋር በ1-2 ቀናት ሊለያይ ይችላል።</em></small></p>`;
    container.innerHTML = html;
}

function setupConverter() {
    const btn = document.getElementById('btn-convert');
    if (!btn) return;
    btn.addEventListener('click', () => {
        let type = document.getElementById('conv-type').value;
        let y = parseInt(document.getElementById('conv-year').value), mStr = document.getElementById('conv-month').value, d = parseInt(document.getElementById('conv-day').value);
        let out = document.getElementById('converter-output');
        if (!out) return;
        
        if (!y || !d) { out.innerHTML = "<p style='color:red;'>እባክዎ ዓመትና ቀን በትክክል ያስገቡ።</p>"; return; }
        
        let gDate;
        if (type === 'eth') {
            let m = parseInt(mStr) || matchMonthName(mStr);
            if (!m || m < 1 || m > 13 || d > getMonthLength(y, m)) { out.innerHTML = "<p style='color:red;'>የተሳሳተ የኢትዮጵያ ወር ወይም ቀን ገብቷል።</p>"; return; }
            gDate = ethToGregorian(y, m, d);
        } else if (type === 'greg') {
            let m = parseInt(mStr); if (!m || m < 1 || m > 12) { out.innerHTML = "<p style='color:red;'>እባክዎ ወር ከ1-12 ቁጥር ያስገቡ።</p>"; return; }
            gDate = new Date(y, m - 1, d);
        } else {
            let m = parseInt(mStr); if (!m || m < 1 || m > 12 || d > getIslamicMonthLength(y, m)) { out.innerHTML = "<p style='color:red;'>የተሳሳተ የሂጅሪ ወር ወይም ቀን ገብቷል።</p>"; return; }
            gDate = jdnToGregorian(islamicToJdn(y, m, d));
        }

        let e = gregorianToEthiopian(gDate.getFullYear(), gDate.getMonth()+1, gDate.getDate());
        let i = jdnToIslamic(gregorianToJdn(gDate.getFullYear(), gDate.getMonth()+1, gDate.getDate()));
        
        out.innerHTML = `<h3>የፍለጋ ውጤት</h3>
        <ul>
            <li><strong>የኢትዮጵያ ቀን፦</strong> ${MONTHS[e.em]} ${e.ed} ቀን ${e.ey} ዓ.ም (${WEEKDAYS[gDate.getDay()]})</li>
            <li><strong>የግሪጎሪያን ቀን፦</strong> ${gDate.toISOString().split('T')[0]}</li>
            <li><strong>የእስልምና (ሂጅሪ) ቀን፦</strong> ${ISLAMIC_MONTHS[i.im]} ${i.id} ቀን ${i.iy} ዓ.ሂ</li>
        </ul>`;
    });
}

function setupSynaxarium() {
    const btn = document.getElementById('btn-search-synax');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        let q = normalizeAmharic(document.getElementById('synax-query').value.trim());
        let out = document.getElementById('synax-output');
        if (!out) return;
        if (!q) { out.innerHTML = "<p style='color:red;'>እባክዎ የፍለጋ ቃል ያስገቡ።</p>"; return; }
        
        let data = await loadSynaxarium();
        let matches = [];
        for (let mName in data) {
            for (let dNum in data[mName]) {
                data[mName][dNum].forEach(entry => {
                    if (normalizeAmharic(entry).includes(q)) matches.push({ mName, dNum, entry });
                });
            }
        }
        if (!matches.length) { out.innerHTML = "<p>ምንም ውጤት አልተገኘም።</p>"; return; }
        out.innerHTML = `<h3>የተገኙ ውጤቶች (${matches.length})</h3><ul>` + 
            matches.map(m => `<li><strong>${m.mName} ${m.dNum}</strong>፦ ${m.entry}</li>`).join('') + `</ul>`;
    });
}

function setupPeriodic() {
    const form = document.getElementById('periodic-form');
    if (!form) return;
    const loadData = () => JSON.parse(localStorage.getItem('periodic_tracker_data')) || { periods: [], cycle_len: 28, period_len: 5 };
    const saveData = (d) => localStorage.setItem('periodic_tracker_data', JSON.stringify(d));
    
    const updateUI = () => {
        let data = loadData(), out = document.getElementById('periodic-output');
        if (!out) return;
        if (!data.periods.length) { out.innerHTML = "<p>ምንም መረጃ አልተመዘገበም።</p>"; return; }
        
        let last = new Date(data.periods[data.periods.length - 1]), today = new Date();
        today.setHours(0,0,0,0); last.setHours(0,0,0,0);
        
        let cycleDay = Math.floor((today - last) / 86400000) + 1;
        let nextStart = new Date(last.getTime() + data.cycle_len * 86400000);
        let ovulation = new Date(nextStart.getTime() - 14 * 86400000);
        
        let status = cycleDay <= data.period_len ? "በወር አበባ ጊዜ ውስጥ ነዎት።" : 
                     (today >= new Date(ovulation.getTime() - 5*86400000) && today <= new Date(ovulation.getTime() + 86400000)) ? 
                     "በመራቢያ (የልጅ መውለጃ) ጊዜ ውስጥ ነዎት።" : "በተለመደው የዑደት ቀናት ውስጥ ነዎት።";
        
        let eNext = gregorianToEthiopian(nextStart.getFullYear(), nextStart.getMonth()+1, nextStart.getDate());
        out.innerHTML = `<h3>የዑደት ሁኔታ መግለጫ</h3>
        <p><strong>የዑደት ቀን፦</strong> ${cycleDay} | <strong>ሁኔታ፦</strong> ${status}</p>
        <p><strong>የሚቀጥለው ዑደት መጀመሪያ፦</strong> ${MONTHS[eNext.em]} ${eNext.ed} ቀን ${eNext.ey} ዓ.ም (${nextStart.toISOString().split('T')[0]})</p>`;
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let y = parseInt(document.getElementById('per-year').value), m = parseInt(document.getElementById('per-month').value), d = parseInt(document.getElementById('per-day').value);
        let g = ethToGregorian(y, m, d);
        
        let data = loadData();
        data.cycle_len = parseInt(document.getElementById('per-cycle').value);
        data.period_len = parseInt(document.getElementById('per-len').value);
        
        let iso = g.toISOString().split('T')[0];
        if(!data.periods.includes(iso)) data.periods.push(iso);
        data.periods.sort();
        saveData(data);
        updateUI();
    });

    const clearBtn = document.getElementById('btn-clear-periodic');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            localStorage.removeItem('periodic_tracker_data');
            updateUI();
        });
    }
    updateUI();
}