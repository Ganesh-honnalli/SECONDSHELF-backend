# SECOND SHELF

Existing static frontend, connected to Supabase Auth, PostgreSQL, Storage and Realtime. The public GitHub Pages site is the root `index.html` application; the unused React `src/` copy is not the deployed entry point.

## Supabase setup

1. Create a Supabase project and open its SQL Editor.
2. Run `supabase/schema.sql`, then `supabase/backend_upgrade.sql`, then `supabase/seed.sql`, in that order. The upgrade migration removes insecure legacy policies and creates the private image bucket, secure feeds, workflows, RPCs and Realtime publication.
3. In Supabase Auth, require email confirmation, configure production SMTP and your site's redirect URL, and set appropriate rate limits/CAPTCHA. Auth confirmation controls verified account access; business owners remain pending until admin review.
4. Create one admin Auth account from the Supabase dashboard (never through the public site). After its email is confirmed, provision the profile using the SQL Editor, replacing the email:

   ```sql
   update public.profiles p set role='admin'
   from auth.users u where p.id=u.id and u.email='admin@your-domain.example';
   update public.user_roles ur set role='admin'
   from public.profiles p where ur.user_id=p.id and p.role='admin';
   ```

   The migration has a partial unique index so the database rejects a second admin. The public signup flow cannot create an admin.
5. Add `.env.local` in the project root (do not commit it):

   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   ```

6. Run `npm run configure:backend`, then serve the root with `npm run start` (or any static server). `backend-config.js` is generated locally and ignored by Git. Only the public anon/publishable key belongs in browser config; never use a service-role key.
7. For GitHub Pages, configure Pages to deploy with GitHub Actions and add repository Actions secrets `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (optional `VITE_TURNSTILE_SITE_KEY`). The workflow writes the generated browser config into the artifact and deploys the root site.

## Security and payment model

RLS is mandatory. Requests, offers, messages, payments, and profile roles must only be mutated through the policies and security-definer RPCs in the migration. Book and waste images live in a private bucket and are displayed using short-lived signed URLs. Recyclers receive only area/PIN and request details before the seller accepts an offer. This app records direct cash/UPI/bank payments; it does not move money or provide escrow.

## Validation

Run `node --check app.js`, `node --check backend.js`, and `node --check configure-backend.mjs`. A live end-to-end check requires a configured Supabase project, Auth email delivery, and provisioned admin account. Do not use sample credentials; `supabase/seed.sql` contains only categories and valuation rules.
