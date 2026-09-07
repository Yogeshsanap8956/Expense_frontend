# Deploy frontend (Cloudflare)

This repo deploys as a **Worker with static assets** (`wrangler.toml` → `[assets] directory = "./dist"`).
The Worker name in `wrangler.toml` must match the project name in the Cloudflare dashboard.

## Build settings

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Variable: `NODE_VERSION` = `20`

## Production API URL

`VITE_API_BASE` is compiled into the bundle at build time.

1. Project → Settings → Variables → add `VITE_API_BASE` = your API origin
   (HTTPS, no trailing slash), e.g. `https://api.yourdomain.com`.
2. Retry the deployment. Saving the variable alone changes nothing.
3. Add the deployed URL to the backend `CORS_ORIGINS`.

Leave `VITE_API_BASE` empty until the backend is hosted; the app builds fine, only login fails.

Install on phones: open the HTTPS URL → browser menu → Add to Home Screen.
