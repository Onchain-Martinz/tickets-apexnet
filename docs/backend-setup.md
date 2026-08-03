# IMSU Exam Prep MVP backend setup

The academic course, schedule, outline, question, answer and supporting-table source remains `lib/data/exams.ts`. Supabase stores identity, onboarding, free allocations, premium access, Kora payments, course representatives, commissions and audit history.

## 1. Supabase database

1. Create separate Supabase projects for local/staging and production use.
2. Install the Supabase CLI and authenticate:

   ```bash
   npm install --global supabase
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. Review and apply the version-controlled migration:

   ```bash
   supabase db push
   ```

4. Confirm the migrations created the two active Psychology cohorts and one active `Premium Platform Access` plan per cohort. Migration `202608030003_restore_production_price.sql` invalidates mismatched pending test checkouts and restores the active price to `150000` NGN minor units (₦1,500).
5. Migration `202608030004_migrate_production_admin.sql` promotes the verified `martinzkizitto@gmail.com` profile and demotes—but does not delete—the dependency-bearing seed administrator.
6. Never create or edit these production tables manually in the dashboard. Add later changes as new files under `supabase/migrations`.

Local `supabase db reset` requires Docker. Run it before deployment in an environment with Docker available.

## 2. Google OAuth

1. In Google Cloud Console, create a Web OAuth client.
2. Add this Google authorized redirect URI exactly:

   ```text
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

3. In Supabase Dashboard, open Authentication > Providers > Google.
4. Enable Google and enter the Google client ID and client secret.
5. In Authentication > URL Configuration:
   - Set the production Site URL.
   - Add `http://localhost:3000/auth/callback` for local development.
   - Add each exact Netlify deploy-preview callback URL used for testing.
   - Add the final custom-domain `/auth/callback` URL before launch.
6. Do not add Google credentials to this repository or Netlify browser variables. They belong in Supabase Auth provider settings.

OAuth always uses the normal student signup. Admin and course-representative roles are assigned later through protected server operations.

## 3. Kora live checkout

1. Obtain the live secret key from the verified Kora account. The public key is optional for Checkout Redirect because initialization is server-side.
2. Set `KORA_ENVIRONMENT=live` for live keys. The server normalizes `test`/`live` case but rejects any other mode.
3. Configure the public notification URL after deployment:

   ```text
   https://YOUR_DOMAIN/api/payments/kora/webhook
   ```

4. The application initializes Kora Checkout Redirect server-side. The return URL is:

   ```text
   https://YOUR_DOMAIN/payment/return
   ```

5. Local initialization omits the notification URL because localhost is not a public HTTPS webhook target.
6. After deployment, verify successful, failed, duplicate and invalid-signature webhook cases before relying on automated fulfillment.

`KORA_WEBHOOK_REQUIRED` must remain `true`. There is no browser-return finalization bypass. The return page only reads payment status; only a correctly signed webhook followed by matching server-to-server Kora verification can call the idempotent payment finalization function.

## 4. Environment variables

Copy `.env.example` to `.env.local` for local development. Use `.env.production.example` as the production checklist and provide real values only through the deployment provider.

Required application variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL` (server-only project URL used by administrative scripts)
- `SUPABASE_SECRET_KEY`
- `KORA_SECRET_KEY`
- `KORA_ENVIRONMENT`
- `KORA_WEBHOOK_REQUIRED`
- `NEXT_PUBLIC_APP_URL`

Legacy Supabase projects may use `SUPABASE_SERVICE_ROLE_KEY` instead of `SUPABASE_SECRET_KEY`. Never expose either server key or `KORA_SECRET_KEY` with a `NEXT_PUBLIC_` prefix. Production rejects test-mode Kora configuration, disabled webhook enforcement, localhost origins, and non-HTTPS application URLs.

If `NEXT_PUBLIC_SUPABASE_SECRET_KEY` was configured previously, remove it and recreate the variable as `SUPABASE_SECRET_KEY`, then restart or redeploy the application. The admin client deliberately rejects the public-prefixed name.

## 5. Initial admin

1. Sign in once through Google and finish level onboarding.
2. Confirm the Google email is verified in Supabase Auth.
3. From a trusted terminal with the server variables loaded, run deliberately:

   ```bash
   INITIAL_ADMIN_EMAIL=martinzkizitto@gmail.com npm run admin:bootstrap
   ```

The command is not called during application startup. It uses `SUPABASE_URL` plus the server-only secret, invokes the service-only `bootstrap_initial_admin` function, and creates an audit entry. It does not initialize a browser client or use Realtime.

## 6. Netlify deployment

1. Connect this repository to a Netlify site.
2. Use the repository root as the base directory.
3. Use `npm run build` as the build command. Netlify's Next.js adapter should detect the `.next` output automatically.
4. Set Node 20 or newer in Netlify. The pinned Supabase packages support Node 20.
5. Add every required variable under Site configuration > Environment variables. Use different test/staging and live values per deploy context.
6. Set `NEXT_PUBLIC_APP_URL` to the exact deploy origin for that context.
7. Add the matching `/auth/callback` URL to the Supabase redirect allow list.
8. Add the matching Kora webhook and return URLs in the Kora dashboard after deployment.
9. Apply migrations to the target Supabase project before deploying the application.
10. Deploy, then test the public calendar before signing in.
11. Test Google signup, immutable onboarding allocation, free access, locked access and Kora checkout initialization.
12. Bootstrap the first admin only after that user has signed in and is visible in `profiles`.

Suggested CLI environment setup:

```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://YOUR_PROJECT_REF.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY "YOUR_PUBLISHABLE_KEY"
netlify env:set SUPABASE_URL "https://YOUR_PROJECT_REF.supabase.co"
netlify env:set SUPABASE_SECRET_KEY "YOUR_SECRET_KEY"
netlify env:set KORA_SECRET_KEY "YOUR_KORA_LIVE_SECRET_KEY"
netlify env:set KORA_ENVIRONMENT "live"
netlify env:set KORA_WEBHOOK_REQUIRED "true"
netlify env:set NEXT_PUBLIC_APP_URL "https://YOUR_SITE.netlify.app"
```

Do not place secrets in `netlify.toml`, client code, build logs or committed `.env` files.

Before deploying, inspect the production variables and confirm:

- `NEXT_PUBLIC_APP_URL` is the exact public HTTPS origin and contains no path.
- No production variable contains `localhost` or `127.0.0.1`.
- `KORA_ENVIRONMENT=live` and `KORA_WEBHOOK_REQUIRED=true`.
- The Kora dashboard webhook URL is `https://YOUR_DOMAIN/api/payments/kora/webhook`.
- The Supabase Site URL and redirect allow list contain the exact production origin and `/auth/callback` route.

## 7. Pre-production checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
git diff --check
```

Also run `supabase db reset` against a disposable local database and exercise Google/Kora flows. These external checks cannot be replaced by a successful unauthenticated production build.
