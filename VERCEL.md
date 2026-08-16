# Deploy FarmX AI to Vercel

Wannan app ɗin **TanStack Start (Vite + Nitro)** ne — ba Next.js ba.

## Vercel Project Settings

| Setting | Value |
| --- | --- |
| Framework Preset | **Other** (kar a zaɓi Next.js) |
| Build Command | `npm run build` |
| Install Command | `npm install` |
| Output Directory | **a bar shi babu komai** (nitro yana fitar da `.vercel/output` da kansa) |
| Node.js Version | 20.x ko sama |

## Environment Variables (Production + Preview)

```
VITE_SUPABASE_URL=https://jocdbvjkrmwhouppmasf.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_l9z1vX0LVhYt5n3HzLDtgg_tTj7PHnS
VITE_SUPABASE_PROJECT_ID=jocdbvjkrmwhouppmasf
SUPABASE_URL=https://jocdbvjkrmwhouppmasf.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_l9z1vX0LVhYt5n3HzLDtgg_tTj7PHnS
GEMINI_API_KEY=<Google AI Studio key>
PAYSTACK_SECRET_KEY=<Paystack live secret key>
```

- `VITE_*` = na browser (Supabase auth/database daga client).
- Marasa `VITE_` = na server kawai (AI da biyan kuɗi). Kar a sa `VITE_` a gabansu.
- Bayan ka ajiye su, sai ka danna **Redeploy** — env vars ba sa aiki har sai an sake deploy.

## Paystack webhook

A Paystack dashboard sa:

```
https://<your-vercel-domain>/api/public/paystack-webhook
```

## Bayanin fasaha

`vite.config.ts` yana saita `nitro: { preset: "vercel" }` ta atomatik idan `VERCEL` env var yana nan, don haka build ɗin yana fitar da Vercel Build Output API (`.vercel/output`) — SSR, API routes (`/api/chat`, `/api/pay/*`, webhook) duk suna aiki.
