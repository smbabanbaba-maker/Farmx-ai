# Green Grow AI — Project TODO

- [x] Extract and inspect the supplied Green Grow AI source without changing its original source structure unnecessarily
- [x] Remove Lovable branding, metadata, badges, and generated references while preserving the app’s original identity and functionality
- [x] Identify and fix the current AI response flow so user prompts reliably return useful responses
- [x] Add Manus-compatible AI agent/backend integration using the project’s existing architecture where possible
- [x] Add or preserve database API integration and authentication only where required by the existing app and supported by the project scaffold
- [x] Add environment-variable documentation and avoid hardcoding secrets
- [x] Add or update unit tests for the AI/API flows
- [x] Run build, lint, unit tests, and local functional checks
- [x] Review the UI visually and verify responsive behavior
- [x] Save a stable project checkpoint/version
- [x] Push the completed code to the user-selected GitHub repository

- [x] Remove Supabase client, auth middleware, generated types, and Supabase-only dependencies
- [x] Replace Supabase authentication with Vercel-compatible application auth and secure session cookies
- [x] Replace Supabase tables and queries with a Vercel-compatible database adapter and schema
- [x] Migrate chat history, profiles, usage quotas, entitlements, and payment records to the new database layer
- [x] Update all API routes and frontend data flows to use the new backend without Supabase imports
- [x] Add Vercel environment-variable documentation and deployment configuration without committing secrets
- [x] Add migration tests for auth, database helpers, chat history, and quota behavior
- [x] Verify build, lint, unit tests, local Vercel-style runtime, and absence of Supabase references
- [x] Commit and push the Supabase-free Vercel migration to GitHub

- [x] Investigate the reported Vercel 404 for `farmx-ai-one.vercel.app` and identify the active deployment URL or missing domain assignment
- [x] Re-test the corrected Vercel URL and document the exact next step if dashboard access or deployment logs are required
- [x] Add the Nitro Vite plugin and TanStack Start Vercel framework detection so server routes stop returning 404
