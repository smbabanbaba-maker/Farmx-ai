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
- [x] Fix the FarmX AI farming-plan prompt error that renders “This page didn't load” instead of an AI response
- [x] Verify the chat API response and error fallback in local and deployed environments

- [ ] Restore Supabase database/auth integration using the connected project without committing secrets
- [ ] Replace the AI provider path with Gemini API and keep server-side key handling
- [ ] Migrate users, profiles, chat history, quotas, and payment persistence to Supabase
- [ ] Verify Supabase schema, auth flow, Gemini chat, tests, and Vercel build
- [ ] Push the Supabase + Gemini version to GitHub and trigger a Vercel deployment

- [x] Diagnose the Vercel Supabase signup/login `Authentication failed` error
- [x] Align auth routes, Supabase client configuration, redirect URL, and session persistence
- [x] Add auth regression tests and verify signup, login, logout, and session restoration

- [x] Add server-side AI image generation for farming diagrams, crop plans, and agriculture visuals
- [x] Add a chat/image UI control with loading, success, and error states
- [x] Add tests for the image-generation route and prompt handling
- [x] Verify image generation locally and in Vercel production
- [ ] Push the image-generation feature to GitHub and trigger a Vercel deployment

# Current request — image reliability and Supabase completion

- [x] Diagnose why the deployed `/api/generate-image` route does not return an image
- [x] Make Manus ImageService/Gemini image generation return a browser-renderable result with clear errors and loading behavior
- [x] Verify Supabase environment configuration and client/server auth wiring
- [x] Complete or correct Supabase schema for profiles, chat history, usage, and subscriptions without committing secrets
- [ ] Verify registration, login, logout, session restoration, and protected API behavior against the user's Supabase project
- [x] Run unit tests, TypeScript checks, production build, and live endpoint checks
- [ ] Push the corrected image and Supabase changes to GitHub

# Current request — chat history controls and auth completion

- [x] Add history actions to delete a chat, pin/unpin a chat, and rename a chat
- [x] Persist history actions through the Supabase-backed threads API
- [x] Fix registration, login, logout, and session restoration error handling
- [x] Verify history and auth flows with tests and production build
- [x] Push the history/auth changes to GitHub

# Current request — remove unrelated application code

- [x] Audit GitHub files, routes, components, branding, and recent commits for non-FarmX application code
- [x] Audit the live deployment for unrelated UI, routes, or metadata
- [x] Remove only confirmed unrelated code and restore FarmX AI as the sole application
- [x] Verify FarmX chat, image route, auth, history controls, branding, and navigation remain intact
- [x] Run tests and production build, then push the cleaned project to GitHub

# Current request — verify Supabase database integration

- [x] Compare Supabase migration tables, columns, indexes, RLS, trigger, RPC, and Storage bucket with application queries
- [ ] Check whether the live Supabase project tables and policies are accessible and working from the user's authenticated Supabase project session
- [x] Fix any schema or application integration mismatches found
- [x] Run database-related tests, TypeScript, and production build
- [x] Report which Supabase features are verified and what still requires the user's project access

# Current request — fix Supabase registration failure

- [x] Inspect the live registration error, signup route, and required Vercel Supabase variables
- [x] Verify Supabase Auth email provider is enabled and new user signup is allowed
- [x] Fix the registration route and user-facing error message if needed
- [x] Backfill `profiles` for existing Auth users and retain the new-user profile trigger
- [x] Run tests/build and push the registration fix to GitHub

# Current request — resolve existing-account login blocker

- [x] Inspect the existing Supabase Auth account status and confirmation state
- [x] Add a password-recovery flow and clearer existing-account sign-in guidance
- [x] Backfill the matching profile record for the existing Auth user
- [x] Run tests/build and push the authentication unblocker to GitHub
