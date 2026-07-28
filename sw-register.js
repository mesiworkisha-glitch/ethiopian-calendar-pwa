if (!("serviceWorker" in navigator)) {
    console.warn("Service Workers are not supported.");
} else {
    window.addEventListener("load", async () => {
        try {
            const registration = await navigator.serviceWorker.register("./sw.js", {
                scope: "./"
            });

            console.log("Service Worker registered.");

            if (registration.waiting) {
                notifyUpdate(registration);
            }

            registration.addEventListener("updatefound", () => {
                const worker = registration.installing;

                if (!worker) return;

                worker.addEventListener("statechange", () => {
                    if (
                        worker.state === "installed" &&
                        navigator.serviceWorker.controller
                    ) {
                        notifyUpdate(registration);
                    }
                });
            });

            navigator.serviceWorker.addEventListener("message", event => {
                if (!event.data) return;

                switch (event.data.type) {
                    case "NEW_VERSION_AVAILABLE":
                        console.log("New version:", event.data.version);
                        break;
                }
            });

            navigator.serviceWorker.addEventListener("controllerchange", () => {
                window.location.reload();
            });

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

function notifyUpdate(registration) {
    const banner = document.getElementById("pwa-update-banner");
    const refresh = document.getElementById("pwa-update-button");
    const dismiss = document.getElementById("pwa-dismiss-button");

    if (!banner || !refresh || !dismiss) return;

    banner.hidden = false;

    refresh.onclick = () => {
        refresh.disabled = true;
        refresh.textContent = "Updating...";

        registration.waiting?.postMessage({
            type: "SKIP_WAITING"
        });
    };

    dismiss.onclick = () => {
        banner.hidden = true;
    };
}