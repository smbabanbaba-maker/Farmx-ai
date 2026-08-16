# Vercel deployment

Wannan app ɗin **TanStack Start (Vite + Nitro)** ne — ba Next.js ba.

## Vercel Project Settings

| Setting          | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| Framework Preset | **Other**                                              |
| Build Command    | `npm run build`                                        |
| Install Command  | `npm install`                                          |
| Output Directory | A bar shi babu komai; Nitro yana fitar da output ɗinsa |
| Node.js Version  | 20.x ko sama                                           |

## Database

A Vercel Marketplace a haɗa **Neon Postgres**. Vercel Postgres na asali ba ya samuwa ga sababbin projects; Neon shi ne Postgres integration da aka fi amfani da shi a Vercel yanzu. Bayan an haɗa Neon, a tabbatar an injected `DATABASE_URL` a Production da Preview environments.

Aikace-aikacen yana ƙirƙirar tables ɗinsa a request na farko: `users`, `sessions`, `profiles`, `chat_threads`, `usage_counters`, `guest_usage`, da `payments`. Session auth yana amfani da secure HttpOnly cookie, yayin da passwords ake hashing da bcrypt.

## Environment Variables

Saka su a Vercel Project Settings → Environment Variables. Kada a saka su cikin GitHub ko `.env`:

```text
DATABASE_URL=<Neon Postgres connection string>
BUILT_IN_FORGE_API_URL=<Manus built-in API URL>
BUILT_IN_FORGE_API_KEY=<Manus built-in API key>
MANUS_CHAT_MODEL=gpt-5-mini
GEMINI_API_KEY=<optional Gemini fallback key>
PAYSTACK_SECRET_KEY=<Paystack secret key>
```

`DATABASE_URL`, `BUILT_IN_FORGE_API_KEY`, `GEMINI_API_KEY`, da `PAYSTACK_SECRET_KEY` server-only ne. `/api/auth` yana aiki da cookies; ba a buƙatar database keys ko public auth tokens a browser.

## Paystack webhook

A Paystack dashboard sa:

```text
https://<your-vercel-domain>/api/public/paystack-webhook
```

## Local development

```bash
npm install
npm run dev
```

Ba a buƙatar migration command na musamman; server zai tabbatar da schema a database a farkon request. Don production mai tsauri, ana iya gudanar da schema statements ɗin daga `src/lib/db.server.ts` a matsayin migration na Neon kafin traffic ya fara.
