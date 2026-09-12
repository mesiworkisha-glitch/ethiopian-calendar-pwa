/* ── Ethiopian Calendar Gitsawe (መጽሐፈ ግጻዌ) Module ───────────────────────── */
(function (root) {
    'use strict';

    let masterData = null;
    let structureData = null;
    let loadPromise = null;

    const MONTH_INDEX_MAP = {
        1: 'መስከረም', 2: 'ጥቅምት', 3: 'ኅዳር', 4: 'ታኅሣሥ',
        5: 'ጥር', 6: 'የካቲት', 7: 'መጋቢት', 8: 'ሚያዝያ',
        9: 'ግንቦት', 10: 'ሰኔ', 11: 'ሐምሌ', 12: 'ነሐሴ', 13: 'ጳጉሜን'
    };

    const AMHARIC_GEEZ_DIGITS = ['zero', '፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱', '፲'];

    function numberToGeez(n) {
        if (n >= 1 && n <= 10) return AMHARIC_GEEZ_DIGITS[n];
        if (n > 10 && n < 20) return '፲' + AMHARIC_GEEZ_DIGITS[n % 10];
        if (n >= 20 && n < 30) return (n === 20 ? '፳' : '፳' + AMHARIC_GEEZ_DIGITS[n % 10]);
        if (n >= 30) return (n === 30 ? '፴' : '፴' + AMHARIC_GEEZ_DIGITS[n % 10]);
        return String(n);
    }

    async function loadGitsawe() {
        if (masterData && structureData) return { master: masterData, structure: structureData };
        if (loadPromise) return loadPromise;

        loadPromise = (async () => {
            try {
                const [masterRes, structRes] = await Promise.all([
                    fetch('gitsawe-master.json'),
                    fetch('gitsawe-structure.json')
                ]);
                masterData = await masterRes.json();
                structureData = await structRes.json();
                buildFastIndex();
                return { master: masterData, structure: structureData };
            } catch (err) {
                console.error('Failed to load Gitsawe datasets:', err);
                loadPromise = null;
                throw err;
            }
        })();

        return loadPromise;
    }

    // Fast lookup cache: dayMap["1-1"] -> day object
    const dayMap = new Map();

    function buildFastIndex() {
        if (!masterData || !masterData.parts || !masterData.parts[0]) return;
        const part1 = masterData.parts[0];
        if (!part1.seasons) return;

        part1.seasons.forEach(season => {
            if (!season.months) return;
            season.months.forEach(m => {
                const mIdx = m.index;
                if (!m.days) return;
                m.days.forEach((d, idx) => {
                    const dayNum = idx + 1; // 1-based day index
                    dayMap.set(`${mIdx}-${dayNum}`, d);
                });
            });
        });
    }

    function getDayReading(monthIndex, dayIndex) {
        const key = `${monthIndex}-${dayIndex}`;
        if (dayMap.has(key)) return dayMap.get(key);

        // Fallback search if index not initialized
        if (!masterData || !masterData.parts || !masterData.parts[0]) return null;
        const part1 = masterData.parts[0];
        for (const season of (part1.seasons || [])) {
            for (const m of (season.months || [])) {
                if (m.index === monthIndex && m.days && m.days[dayIndex - 1]) {
                    return m.days[dayIndex - 1];
                }
            }
        }
        return null;
    }

    function searchGitsawe(query) {
        if (!query || !masterData || !masterData.parts) return [];
        const q = String(query).trim().toLowerCase();
        if (!q) return [];

        const results = [];
        const part1 = masterData.parts[0];

        if (part1 && part1.seasons) {
            part1.seasons.forEach(season => {
                (season.months || []).forEach(m => {
                    (m.days || []).forEach((d, dIdx) => {
                        const dayNum = dIdx + 1;
                        let matched = false;
                        const matchText = [];

                        if (d.commemoration && d.commemoration.toLowerCase().includes(q)) {
                            matched = true;
                            matchText.push(`ተዝካር: ${d.commemoration}`);
                        }

                        const services = d.services || {};
                        ['ዘነግህ', 'ዘቅዳሴ', 'ዘሠርክ'].forEach(srvKey => {
                            const srv = services[srvKey];
                            if (!srv) return;
                            if (srv.ምስባክ) {
                                const msb = srv.ምስባክ;
                                const bookCh = `${msb.book || ''} ${msb.chapter_verse || ''}`.toLowerCase();
                                const versesText = (msb.verses || []).join(' ').toLowerCase();
                                if (bookCh.includes(q) || versesText.includes(q)) {
                                    matched = true;
                                    matchText.push(`${srvKey} ምስባክ: ${msb.book || ''} ${msb.chapter_verse || ''}`);
                                }
                            }
                            if (srv.ወንጌል) {
                                const wng = srv.ወንጌል;
                                const bookCh = `${wng.book || ''} ${wng.chapter_verse || ''}`.toLowerCase();
                                const incipit = (wng.incipit || '').toLowerCase();
                                if (bookCh.includes(q) || incipit.includes(q)) {
                                    matched = true;
                                    matchText.push(`${srvKey} ወንጌል: ${wng.book || ''} ${wng.chapter_verse || ''} (${wng.incipit || ''})`);
                                }
                            }
                            if (srv.epistles_and_acts) {
                                srv.epistles_and_acts.forEach(ep => {
                                    const epText = `${ep.reading_type || ''} ${ep.chapter_verse || ''} ${ep.incipit || ''}`.toLowerCase();
                                    if (epText.includes(q)) {
                                        matched = true;
                                        matchText.push(`${srvKey} ንባብ: ${ep.reading_type || ''} ${ep.chapter_verse || ''}`);
                                    }
                                });
                            }
                        });

                        if (matched) {
                            results.push({
                                monthIndex: m.index,
                                monthName: m.month,
                                dayIndex: dayNum,
                                dayGeez: d.day_number || numberToGeez(dayNum),
                                commemoration: d.commemoration || '',
                                matches: matchText,
                                reading: d
                            });
                        }
                    });
                });
            });
        }
        return results;
    }

    function esc(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function formatReadingHtml(dayReading, options = {}) {
        if (!dayReading) return `<div class="gitsawe-empty">ለዚህ ቀን የትምህርትና የመዝሙር ግጻዌ መረጃ አልተገኘም።</div>`;

        const srv = dayReading.services || {};
        let html = `<div class="gitsawe-card">`;

        if (dayReading.commemoration) {
            html += `<div class="gitsawe-commemoration"><strong>የዕለቱ መታሰቢያ (በዓል/ቅዱሳን)፦</strong> ${esc(dayReading.commemoration)}</div>`;
        }

        let refCounter = 0;
        const em = options.month || '', ed = options.day || '';

        // Render Service Sections
        const renderServiceBlock = (title, slotKey, serviceData) => {
            if (!serviceData) return '';
            let sHtml = `<div class="gitsawe-service-block"><h4>${esc(title)}</h4>`;

            // Mesbak
            if (serviceData.ምስባክ) {
                const m = serviceData.ምስባክ;
                const refId = `gitsawe-ref-${++refCounter}`;
                sHtml += `<div class="gitsawe-mesbak">
                    <span class="gitsawe-badge">ምስባክ</span> 
                    <strong>${esc(m.book || 'መዝሙር')} ${esc(m.chapter_verse || '')}</strong>`;
                if (m.psalm_masoretic) sHtml += ` <small class="gitsawe-psalm-ref">(መዝ. ${esc(m.psalm_masoretic)})</small>`;
                if (Array.isArray(m.verses) && m.verses.length) {
                    sHtml += `<ul class="gitsawe-verses">`;
                    m.verses.forEach(v => { sHtml += `<li>${esc(v)}</li>`; });
                    sHtml += `</ul>`;
                }
                sHtml += `<p class="gitsawe-fulltext-toggle-row"><button type="button" class="gitsawe-fulltext-toggle" data-book="${esc(m.book || '')}" data-cv="${esc(m.chapter_verse || '')}" data-context="psalm" data-month="${esc(em)}" data-day="${esc(ed)}" data-slot="${esc(slotKey)}" data-role="mesbak" data-target="${refId}" aria-expanded="false" aria-controls="${refId}" data-ctx-label="ምስባክ ${esc(m.book || '')} ${esc(m.chapter_verse || '')}" aria-label="ሙሉ ጽሑፍ አሳይ፦ ምስባክ ${esc(m.book || '')} ${esc(m.chapter_verse || '')}">ሙሉ ጽሑፍ አሳይ</button></p>
                    <div class="gitsawe-fulltext" id="${refId}" role="region" aria-live="polite" hidden></div>`;
                sHtml += `</div>`;
            }

            // Epistles & Acts (Qiddase)
            if (Array.isArray(serviceData.epistles_and_acts) && serviceData.epistles_and_acts.length) {
                sHtml += `<div class="gitsawe-epistles">
                    <span class="gitsawe-badge">መልእክታትና ግብረ ሐዋርያት</span><ul class="gitsawe-epistle-list">`;
                serviceData.epistles_and_acts.forEach((ep, epIdx) => {
                    const refId = `gitsawe-ref-${++refCounter}`;
                    sHtml += `<li><strong>${esc(ep.reading_type || '')} ${esc(ep.chapter_verse || '')}</strong>`;
                    if (ep.incipit) sHtml += ` — <span class="gitsawe-incipit">"${esc(ep.incipit)}"</span>`;
                    sHtml += `<p class="gitsawe-fulltext-toggle-row"><button type="button" class="gitsawe-fulltext-toggle" data-book="${esc(ep.reading_type || '')}" data-cv="${esc(ep.chapter_verse || '')}" data-context="epistle" data-month="${esc(em)}" data-day="${esc(ed)}" data-slot="${esc(slotKey)}" data-role="ep${epIdx}" data-target="${refId}" aria-expanded="false" aria-controls="${refId}" data-ctx-label="${esc(ep.reading_type || '')} ${esc(ep.chapter_verse || '')}" aria-label="ሙሉ ጽሑፍ አሳይ፦ ${esc(ep.reading_type || '')} ${esc(ep.chapter_verse || '')}">ሙሉ ጽሑፍ አሳይ</button></p>
                        <div class="gitsawe-fulltext" id="${refId}" role="region" aria-live="polite" hidden></div>`;
                    sHtml += `</li>`;
                });
                sHtml += `</ul></div>`;
            }

            // Gospel
            if (serviceData.ወንጌል) {
                const g = serviceData.ወንጌል;
                const refId = `gitsawe-ref-${++refCounter}`;
                sHtml += `<div class="gitsawe-gospel">
                    <span class="gitsawe-badge gitsawe-badge-gospel">ወንጌል</span> 
                    <strong>${esc(g.book || '')} ${esc(g.chapter_verse || '')}</strong>`;
                if (g.incipit) sHtml += `<div class="gitsawe-incipit">"${esc(g.incipit)}"</div>`;
                sHtml += `<p class="gitsawe-fulltext-toggle-row"><button type="button" class="gitsawe-fulltext-toggle" data-book="${esc(g.book || '')}" data-cv="${esc(g.chapter_verse || '')}" data-context="gospel" data-month="${esc(em)}" data-day="${esc(ed)}" data-slot="${esc(slotKey)}" data-role="gospel" data-target="${refId}" aria-expanded="false" aria-controls="${refId}" data-ctx-label="ወንጌል ${esc(g.book || '')} ${esc(g.chapter_verse || '')}" aria-label="ሙሉ ጽሑፍ አሳይ፦ ወንጌል ${esc(g.book || '')} ${esc(g.chapter_verse || '')}">ሙሉ ጽሑፍ አሳይ</button></p>
                    <div class="gitsawe-fulltext" id="${refId}" role="region" aria-live="polite" hidden></div>`;
                sHtml += `</div>`;
            }

            // Anaphora (Qiddase)
            if (serviceData.ቅዳሴ) {
                sHtml += `<div class="gitsawe-anaphora">
                    <span class="gitsawe-badge gitsawe-badge-anaphora">ቅዳሴ</span> 
                    <strong>${esc(serviceData.ቅዳሴ)}</strong>
                </div>`;
            }

            sHtml += `</div>`;
            return sHtml;
        };

        // Morning Service (ዘነግህ)
        if (srv.ዘነግህ) html += renderServiceBlock('ዘነግህ (Morning Reading)', 'ዘነግህ', srv.ዘነግህ);
        // Liturgy Service (ዘቅዳሴ)
        if (srv.ዘቅዳሴ) html += renderServiceBlock('ዘቅዳሴ (Eucharistic Liturgy Readings)', 'ዘቅዳሴ', srv.ዘቅዳሴ);
        // Evening Service (ዘሠርክ)
        if (srv.ዘሠርክ) html += renderServiceBlock('ዘሠርክ (Evening Reading)', 'ዘሠርክ', srv.ዘሠርክ);

        html += `</div>`;
        return html;
    }

    root.EthioGitsawe = {
        loadGitsawe,
        getDayReading,
        searchGitsawe,
        formatReadingHtml,
        numberToGeez,
        MONTH_INDEX_MAP,
        getMasterData: () => masterData,
        getStructureData: () => structureData
    };
})(typeof window !== 'undefined' ? window : globalThis);
