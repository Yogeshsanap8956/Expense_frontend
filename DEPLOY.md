# Deploy frontend (Cloudflare Pages)

1. Push this repo (or connect GitHub in Cloudflare).
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect GitHub `Expense_frontend`.
3. Build: `npm run build` · Output: `dist` · Node 20+.
4. Production env var: `VITE_API_BASE` = your Oracle API URL (HTTPS, no trailing slash), e.g. `https://api.yourdomain.com`.
5. Redeploy after setting `VITE_API_BASE` (it is baked in at build time).

Install on phones: open the Pages URL on HTTPS → browser menu → Add to Home Screen.
