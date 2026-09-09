// Flag to prevent infinite reload loops during controller change
let refreshing = false;

const PWA_UPDATE_STRINGS = {
    am: { title: "አዲስ ዝማኔ አለ", desc: "የኢትዮጵያ ካላንደር አዲስ ስሪት ዝግጁ ነው።", refresh: "አድስ", updating: "በማዘመን ላይ...", dismiss: "በኋላ" },
    en: { title: "Update Available", desc: "A new version of Ethiopian Calendar is ready.", refresh: "Refresh", updating: "Updating...", dismiss: "Later" },
    om: { title: "Haaromsi Jira", desc: "Sirni haaraa Kalandarii Itoophiyaa qophaa'eera.", refresh: "Haaromsi", updating: "Haaromsaa jira...", dismiss: "Booda" },
    ti: { title: "ሓድሽ ዕዳጋ ኣሎ", desc: "ሓድሽ ስሪት ናይ ኢትዮጵያዊ ካላንደር ተዳልዩ ኣሎ።", refresh: "ኣድስ", updating: "ይሓድስ ኣሎ...", dismiss: "ደሓር" },
    so: { title: "Cusboonaysiin Diyaar Ah", desc: "Nooc cusub oo Kalandarka Itoobiya ah ayaa diyaar ah.", refresh: "Cusboonaysii", updating: "Waa la cusboonaysiinayaa...", dismiss: "Ka Dib" }
};

function getPwaUpdateStrings() {
    let lang = 'am';
    try { lang = localStorage.getItem('lang') || 'am'; } catch (_) {}
    return PWA_UPDATE_STRINGS[lang] || PWA_UPDATE_STRINGS.am;
}

function loadPlanningFeature() {
    if (document.getElementById('planning-feature-css')) return;
    const css = document.createElement('link');
    css.id = 'planning-feature-css'; css.rel = 'stylesheet'; css.href = './planning.css';
    document.head.appendChild(css);
    const planner = document.createElement('script'); planner.src = './planning.js';
    planner.onload = () => { const ui = document.createElement('script'); ui.src = './planning-ui.js'; document.body.appendChild(ui); };
    document.body.appendChild(planner);
}

if (!("serviceWorker" in navigator)) {
    console.warn("Service Workers are not supported.");
} else {
    window.addEventListener("load", async () => {
        loadPlanningFeature();
        try {
            const registration = await navigator.serviceWorker.register("./sw.js", { scope: "./" });
            console.log("Service Worker registered.");
            if (registration.waiting) notifyUpdate(registration.waiting);
            registration.addEventListener("updatefound", () => {
                const newWorker = registration.installing;
                if (!newWorker) return;
                newWorker.addEventListener("statechange", () => {
                    if (newWorker.state === "installed" && navigator.serviceWorker.controller) notifyUpdate(newWorker);
                });
            });
            navigator.serviceWorker.addEventListener("controllerchange", () => {
                if (refreshing) return;
                refreshing = true;
                window.location.reload();
            });
            window.addEventListener("pageshow", () => {
                document.getElementById("pwa-update-banner")?.setAttribute("hidden", "");
            });
        } catch (error) {
            console.error("Service Worker registration failed:", error);
        }
    });
}

function notifyUpdate(worker) {
    const banner = document.getElementById("pwa-update-banner");
    const refresh = document.getElementById("pwa-update-button");
    const dismiss = document.getElementById("pwa-dismiss-button");
    const titleEl = document.getElementById("pwa-update-title");
    const descEl = document.getElementById("pwa-update-desc");
    if (!banner || !refresh || !dismiss) return;
    const strings = getPwaUpdateStrings();
    if (titleEl) titleEl.textContent = strings.title;
    if (descEl) descEl.textContent = strings.desc;
    refresh.textContent = strings.refresh;
    dismiss.textContent = strings.dismiss;
    banner.hidden = false;
    refresh.onclick = () => { refresh.disabled = true; refresh.textContent = strings.updating; worker.postMessage({ type: "SKIP_WAITING" }); };
    dismiss.onclick = () => { banner.hidden = true; };
}
