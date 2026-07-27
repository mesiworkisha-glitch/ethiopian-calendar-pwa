// Registers the service worker. Kept as its own tiny external file (rather
// than an inline <script> in index.html) so the site's Content-Security-Policy
// can use a strict `script-src 'self'` with no 'unsafe-inline' exception.
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
}
