/* ==========================================================================
   embed.js — renders a single compact widget inside embed.html.
   Relies on globals/functions already defined in app.js (loaded first):
   i18n, t(), fNum(), currentLang, useGeezNumerals, getMonths(), getWeekdays(),
   gregorianToEthiopian(), gregorianToJdn(), jdnToEthiopian(), jdnToIslamic(),
   islamicToJdn(), getIslamicMonthLength(), calculateBahreHasab(), getSeasons(),
   getUpcomingEvents(), getFdreHolidays(), loadSynaxarium(), setupConverter(),
   getEmbedWidgetContent().
   ========================================================================== */

(function () {
    var SUPPORTED_LANGS = ["am", "en", "om", "ti", "so", "gur"];

    function getParam(name, fallback) {
        const params = new URLSearchParams(window.location.search);
        const val = params.get(name);
        return val === null || val === "" ? fallback : val;
    }

    // Auto-detect theme from the visitor's OS/browser preference when no explicit ?theme= is given.
    function detectPreferredTheme() {
        try { return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'; }
        catch (e) { return 'light'; }
    }

    // Auto-detect language from the visitor's browser settings when no explicit ?lang= is given.
    function detectPreferredLang() {
        try {
            const langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'am'];
            for (const l of langs) {
                const base = String(l).toLowerCase().split('-')[0];
                if (SUPPORTED_LANGS.includes(base)) return base;
            }
        } catch (e) { /* ignore */ }
        return 'am';
    }

    function notifyResize() {
        try {
            const height = document.body.scrollHeight;
            window.parent.postMessage({ type: "ethiocal-embed-resize", height: height }, "*");
        } catch (e) { /* not embedded in an iframe, or cross-origin restriction — ignore */ }
    }

    async function renderConverterWidget(container) {
        container.innerHTML = `
            <h3 class="embed-heading">${t('conv_title')}</h3>
            <div class="form-group">
                <label for="conv-type">${t('conv_label_type')}</label>
                <select id="conv-type">
                    <option value="eth">${t('opt_eth')}</option>
                    <option value="greg">${t('opt_greg')}</option>
                    <option value="julian">${t('opt_jul')}</option>
                    <option value="hebrew">${t('opt_heb')}</option>
                    <option value="hijri">${t('opt_hij')}</option>
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="conv-year">${t('conv_label_year')}</label>
                    <input type="number" id="conv-year" placeholder="${t('ph_year')}">
                </div>
                <div class="form-group">
                    <label for="conv-month">${t('conv_label_month')}</label>
                    <input type="text" id="conv-month" placeholder="${t('ph_month')}">
                </div>
                <div class="form-group">
                    <label for="conv-day">${t('conv_label_day')}</label>
                    <input type="number" id="conv-day" placeholder="${t('ph_day')}">
                </div>
            </div>
            <button id="btn-convert" class="btn-primary">${t('btn_convert')}</button>
            <div id="converter-output" class="info-output margin-top" aria-live="polite"></div>
        `;
        // Wire up the button using the exact same logic as the main app's converter tab.
        setupConverter();
        const out = container.querySelector('#converter-output');
        if (out) {
            const observer = new MutationObserver(notifyResize);
            observer.observe(out, { childList: true, subtree: true });
        }
    }

    function renderHijriWidget(container, content) {
        container.innerHTML = content.html + `
            <div class="embed-form">
                <div class="form-group" style="min-width:160px;">
                    <label for="embed-hijri-date">${t('opt_greg')}</label>
                    <input type="date" id="embed-hijri-date">
                </div>
                <button id="embed-hijri-btn" class="btn-primary">${t('btn_convert')}</button>
            </div>
            <div id="embed-hijri-result" class="embed-result"></div>
        `;
        const dateInput = container.querySelector('#embed-hijri-date');
        const btn = container.querySelector('#embed-hijri-btn');
        const resultEl = container.querySelector('#embed-hijri-result');
        const now = new Date();
        if (dateInput) {
            try { dateInput.valueAsDate = now; } catch (e) { dateInput.value = now.toISOString().slice(0, 10); }
        }
        if (btn) btn.addEventListener('click', () => {
            const val = dateInput.value;
            if (!val) return;
            const parts = val.split('-').map(Number), gy = parts[0], gm = parts[1], gd = parts[2];
            const gjdn = gregorianToJdn(gy, gm, gd);
            const gisl = jdnToIslamic(gjdn), geth = jdnToEthiopian(gjdn);
            const mList = getMonths(), islMonths = t('islamic_months');
            resultEl.innerHTML = `<p><strong>${t('lbl_hijri')}:</strong> ${islMonths[gisl.im]} ${fNum(gisl.id)}, ${fNum(gisl.iy)}</p><p><strong>${t('lbl_ethiopian')}:</strong> ${mList[geth.em]} ${fNum(geth.ed)}, ${fNum(geth.ey)}</p>`;
            notifyResize();
        });
    }

    async function render() {
        // A dedicated wrapper page (e.g. embed-holidays.html, used for oEmbed discovery)
        // can pin the widget type via window.EMBED_WIDGET_DEFAULT before this script runs,
        // while still letting ?lang=/?theme=/?id= etc. be customized per query string.
        const widget = getParam('widget', typeof window.EMBED_WIDGET_DEFAULT !== 'undefined' ? window.EMBED_WIDGET_DEFAULT : 'today');
        const lang = getParam('lang', null) || detectPreferredLang();
        const theme = getParam('theme', null) || detectPreferredTheme();
        const numerals = getParam('numerals', 'arabic');
        const style = getParam('style', 'full');
        const holidayId = getParam('id', null);

        if (typeof i18n !== 'undefined' && i18n[lang]) currentLang = lang;
        useGeezNumerals = numerals === 'geez';
        if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

        const container = document.getElementById('embed-widget');
        const footerLink = document.querySelector('.embed-footer-link');

        if (style === 'badge') {
            document.body.classList.add('badge-mode');
            if (footerLink) footerLink.hidden = true;
        }

        if (!container) return;

        try {
            if (style === 'badge') {
                const content = await getEmbedWidgetContent(widget === 'holiday' ? 'holiday' : (EMBED_WIDGET_TYPES.includes(widget) ? widget : 'today'), { id: holidayId });
                const siteUrl = new URL('.', window.location.href).href;
                container.innerHTML = `<a class="embed-badge" href="${siteUrl}" target="_blank" rel="noopener noreferrer">📅 ${content.title}</a>`;
            } else if (widget === 'converter') {
                await renderConverterWidget(container);
            } else if (widget === 'hijri') {
                const content = await getEmbedWidgetContent('hijri');
                renderHijriWidget(container, content);
            } else if (widget === 'holiday') {
                const content = await getEmbedWidgetContent('holiday', { id: holidayId });
                container.innerHTML = content.html;
            } else {
                const content = await getEmbedWidgetContent(EMBED_WIDGET_TYPES.includes(widget) ? widget : 'today');
                container.innerHTML = content.html;
            }
        } catch (err) {
            console.error('Embed widget render error:', err);
            container.innerHTML = '<p>⚠️ Unable to load widget.</p>';
        }

        notifyResize();
        if (window.ResizeObserver) {
            new ResizeObserver(notifyResize).observe(document.body);
        } else {
            window.addEventListener('load', notifyResize);
        }
    }

    document.addEventListener('DOMContentLoaded', render);
})();
