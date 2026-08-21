# FarmX AI Supabase Auth Audit — 2026-08-21

## Live findings

- Project: `farmx ai` (`wjxfdnqhtdcbkokmpehc`).
- Supabase Authentication → URL Configuration currently has `Site URL` set to `http://localhost:3000`.
- There are no configured Redirect URLs.
- This blocks or misroutes FarmX production confirmation and password-reset emails because the Vercel domain is not allow-listed.

## Required production values

- Site URL: `https://farmx-ai-one.vercel.app`
- Redirect URL: `https://farmx-ai-one.vercel.app/auth`
- Redirect URL: `https://farmx-ai-one.vercel.app/reset-password`

## Configuration progress

The Site URL field was updated from localhost to the FarmX Vercel production domain. Redirect URLs still need to be added to the allow list.

The redirect URLs being added are `https://farmx-ai-one.vercel.app/auth` and `https://farmx-ai-one.vercel.app/reset-password`.

The first save attempt closed the dialog but the allow list still displayed no redirect URLs. The second save succeeded. Supabase now shows two redirect URLs: the FarmX `/auth` URL and the FarmX `/reset-password` URL.

## Auth provider and account status

Email authentication and new user signup are enabled. Email confirmation is enabled. The existing `smbabanbaba@gmail.com` Auth user has a recorded last sign-in time, so the account exists and has previously completed a sign-in; it is not a new-registration problem. The correct recovery path is sign-in with the existing password or the FarmX password-reset flow after the latest Vercel deployment.
