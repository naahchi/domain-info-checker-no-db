# Domain Info Checker

A browser-only domain lookup prototype. No database, login, API key, or backend is included.

## Run
1. Extract the ZIP.
2. Open `index.html` in a modern browser.
3. Enter a domain such as `example.com` or `example.in`.

If browser restrictions prevent an API request when opening the file directly, run a local static server from this folder:
- Python: `python -m http.server 8000`
- Then open `http://localhost:8000`

## Data sources
- IANA RDAP DNS bootstrap: discovers the RDAP server for the domain's TLD.
- Registry RDAP server: registration events, registrar, status and nameservers when published.
- Google Public DNS JSON API: A, AAAA, MX, NS, TXT and CAA lookups.
- crt.sh: Certificate Transparency records (when browser access is allowed).

## Important limitations
- Expiration and creation dates are not published consistently for every TLD.
- Registry expiration is not necessarily the registrar's renewal/payment date.
- Certificate Transparency records do not guarantee which certificate is currently served by the live website.
- Website online/offline checking is omitted because browser CORS restrictions make a reliable direct check impossible without a proxy/backend.
- Public APIs can rate-limit requests, change availability, or block browser requests. This project has no fallback backend.

## Files
- `index.html` — interface
- `styles.css` — responsive styling
- `app.js` — RDAP discovery and public data lookups
