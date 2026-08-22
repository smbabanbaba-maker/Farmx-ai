# Live Supabase Auth URL Findings — 2026-08-22

The live FarmX Supabase project is configured with `https://farmx-ai-one.vercel.app` as the Site URL. The visible Redirect URLs allow-list currently contains only `https://farmx-ai-one.vercel.app/auth`.

Before enabling the planned Google OAuth callback and preserving password recovery, the allow-list needs these additional exact URLs:

- `https://farmx-ai-one.vercel.app/auth-callback`
- `https://farmx-ai-one.vercel.app/reset-password`

Google itself must also be enabled in Supabase Authentication → Sign In / Providers with a Google OAuth Client ID and Client Secret. Those credentials must not be committed to the FarmX repository or pasted into chat.

## Provider status

The Supabase Auth provider screen confirms that email authentication is enabled and Google authentication is currently disabled. Google sign-in can be implemented in FarmX, but it will only complete once the project owner enables the Google provider and enters Google OAuth credentials in the Supabase dashboard.

## Local UI verification

The rebuilt `/auth` screen renders the Google entry point, email/password fields, Forgot password action, clear Sign in / Create account navigation, and English copy. Native browser validation correctly prevents an empty sign-in submission and points to the required email field before any request is sent.
