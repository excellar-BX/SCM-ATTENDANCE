# SCM Attendance

QR-code attendance for services. Members sign up once, then scan the service QR code to be marked present. Admins see who came, who didn't, who has gone quiet, and whose birthday is coming up.

Built with Next.js 16 (App Router), Neon Postgres and Tailwind CSS 4.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Check `.env` (see `.env.example`):
   - `DATABASE_URL`: your Neon connection string
   - `AUTH_SECRET`: a long random string used to sign login sessions
   - `APP_TIMEZONE`: used for "today", birthdays and service dates (default `Africa/Lagos`)
   - `APP_URL` (optional): the public URL put inside QR codes. If you leave it out, the current site address is used.
3. Create the database tables (safe to run again):
   ```bash
   npm run db:migrate
   ```
4. Start the app and create your own account at `/signup`:
   ```bash
   npm run dev
   ```
5. Make yourself an admin:
   ```bash
   npm run make-admin -- you@example.com
   ```
   After that, you can make other people admins from their member page.

## How it works

**Members**
- Sign up with full name, email, phone, gender, birthday (day and month only), level, campus address, and whether it's their first time.
- At service, they scan the QR code with their phone camera. If they're signed in, they're marked present straight away. If not, they sign in or sign up and are then checked in automatically.
- After checking in, they can rate the service (1–5 stars) and leave a comment.
- `/me` shows their attendance history, attendance rate and streak.

**Admins** (`/admin`)
- **Services & QR**: create a service and get its QR code. You can show it full screen with a live check-in count (good for a projector), download it as a PNG, or copy the link. You can close or reopen check-in, or issue a new code so old screenshots stop working.
- **Present / Absent / Feedback** for each service. Anyone who had signed up by the service date and didn't scan shows as absent until they scan. You can also mark people present by hand, for example if their phone died.
- **Dashboard**: attendance trend, average attendance compared with the services before, average rating, and a "needs attention" list (inactive members, birthdays today, new first-timers, past services still open).
- **Members**: search, filter by level or status, open full details, export to CSV.
- **Inactive**: members who missed 2, 3, 4 or 6+ services in a row, with call and WhatsApp links.
- **Birthdays**: today's birthdays, the next 30 days, and the whole year by month.

## Deploying

This works on Vercel or any Node host. Set the same environment variables there. Set `APP_URL` to your live domain so QR codes always point to the right place.
