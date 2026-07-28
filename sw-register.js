// Flag to prevent infinite reload loops during controller change
let refreshing = false;

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

    if (!banner || !refresh || !dismiss) return;

    banner.hidden = false;

    // Remove existing event listeners by cloning if necessary, or just overwrite
    refresh.onclick = () => {
        refresh.disabled = true;
        refresh.textContent = "Updating...";

        // Send the skip waiting message directly to the specific worker
        worker.postMessage({
            type: "SKIP_WAITING"
        });
    };

    dismiss.onclick = () => {
        banner.hidden = true;
    };
}