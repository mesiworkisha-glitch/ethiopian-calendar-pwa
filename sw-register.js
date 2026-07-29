// Flag to prevent infinite reload loops during controller change
let refreshing = false;

// Self-contained translations for the update-banner text — deliberately NOT
// dependent on app.js's i18n system (this script must keep working even if
// app.js changes independently), just reads the same localStorage 'lang'
// key the rest of the app already uses to persist the user's choice.
const PWA_UPDATE_STRINGS = {
    am: { title: "አዲስ ዝማኔ አለ", desc: "የኢትዮጵያ ካላንደር አዲስ ስሪት ዝግጁ ነው።", refresh: "አድስ", updating: "በማዘመን ላይ...", dismiss: "በኋላ" },
    en: { title: "Update Available", desc: "A new version of Ethiopian Calendar is ready.", refresh: "Refresh", updating: "Updating...", dismiss: "Later" },
    om: { title: "Haaromsi Jira", desc: "Sirni haaraa Kalandarii Itoophiyaa qophaa'eera.", refresh: "Haaromsi", updating: "Haaromsaa jira...", dismiss: "Booda" },
    ti: { title: "ሓድሽ ዕዳጋ ኣሎ", desc: "ሓድሽ ስሪት ናይ ኢትዮጵያዊ ካላንደር ተዳልዩ ኣሎ።", refresh: "ኣድስ", updating: "ይሓድስ ኣሎ...", dismiss: "ደሓር" },
    so: { title: "Cusboonaysiin Diyaar Ah", desc: "Nooc cusub oo Kalandarka Itoobiya ah ayaa diyaar ah.", refresh: "Cusboonaysii", updating: "Waa la cusboonaysiinayaa...", dismiss: "Ka Dib" },
};

function getPwaUpdateStrings() {
    let lang = 'am';
    try { lang = localStorage.getItem('lang') || 'am'; } catch (e) { /* storage blocked — fall back to default */ }
    return PWA_UPDATE_STRINGS[lang] || PWA_UPDATE_STRINGS.am;
}

if (!("serviceWorker" in navigator)) {
    console.warn("Service Workers are not supported.");
} else {
    window.addEventListener("load", async () => {
        try {
            const registration = await navigator.serviceWorker.register("./sw.js", {
                scope: "./"
            });

            console.log("Service Worker registered.");

            // 1. Check if a service worker is already waiting to activate
            if (registration.waiting) {
                notifyUpdate(registration.waiting);
            }

            // 2. Listen for new service worker installations
            registration.addEventListener("updatefound", () => {
                const newWorker = registration.installing;

                if (!newWorker) return;

                newWorker.addEventListener("statechange", () => {
                    // Only notify if there's an existing controller (meaning it's an update, not a fresh install)
                    if (
                        newWorker.state === "installed" &&
                        navigator.serviceWorker.controller
                    ) {
                        notifyUpdate(newWorker);
                    }
                });
            });

            // 3. Listen for the new service worker taking control
            navigator.serviceWorker.addEventListener("controllerchange", () => {
                if (refreshing) return;
                refreshing = true;
                window.location.reload();
            });

            // Clean up UI on page restore/show
            window.addEventListener("pageshow", () => {
                document
                    .getElementById("pwa-update-banner")
                    ?.setAttribute("hidden", "");
            });

        } catch (error) {
            console.error("Service Worker registration failed:", error);
        }
    });
}

/**
 * Triggers the UI banner for a pending update and handles interactions.
 * @param {ServiceWorker} worker - The specific service worker waiting to activate.
 */
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

    // Remove existing event listeners by cloning if necessary, or just overwrite
    refresh.onclick = () => {
        refresh.disabled = true;
        refresh.textContent = strings.updating;

        // Send the skip waiting message directly to the specific worker
        worker.postMessage({
            type: "SKIP_WAITING"
        });
    };

    dismiss.onclick = () => {
        banner.hidden = true;
    };
}