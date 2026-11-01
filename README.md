# Mealify

A mobile-first surplus food marketplace for India. Restaurants/bakeries ("partners") list
discounted surplus food ("Mealify Bags"); customers browse nearby bags, add to cart, and pay
in-app for pickup.

- **Mobile app:** `mobile/` — Expo (React Native)
- **API:** `server/` — Node.js + Express
- **Database:** PostgreSQL

## 1. Database setup

Pick ONE:

### Option A — Local PostgreSQL (Windows)
1. Install PostgreSQL 17 from https://www.postgresql.org/download/windows/
2. Remember the superuser password you set during install.
3. Create the database: open **SQL Shell (psql)** (installed alongside Postgres) and run:
   ```sql
   CREATE DATABASE mealify;
   ```
4. In `server/.env` (copy from `server/.env.example`), set:
   ```
   DATABASE_URL=postgresql://postgres:<your-password>@localhost:5432/mealify
   ```

### Option B — Docker (if WSL2 is available)
```
cd server
docker compose up -d
```
Then in `server/.env`: `DATABASE_URL=postgresql://mealify:mealify@localhost:5432/mealify`

### Option C — Free cloud Postgres (Neon / Supabase)
Create a project, copy its connection string into `server/.env` as `DATABASE_URL`
(make sure `?sslmode=require` is included if provided).

## 2. Run the API

```
cd server
npm install
copy .env.example .env      # then edit DATABASE_URL as above
npm run db:migrate          # creates all tables
npm run db:seed             # loads demo partners, listings, customers, orders
npm run dev                 # starts the API on http://localhost:4000
```

Health check: http://localhost:4000/health

## 3. Run the mobile app

The app auto-detects your computer's LAN IP from the Expo dev server, so it talks to the API
correctly when opened via Expo Go on a phone — as long as your phone and computer are on the
**same Wi-Fi network**.

```
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android/iOS). To run instead in an Android emulator, press `a`
after `expo start`.

## Demo accounts (created by the seed script)

- **Customer:** `aditi.sharma@example.com` / `password123`
- **Customer (Hindi preference):** `priya.nair@example.com` / `password123`
- **Partner staff:** `manager@bombay.bites.bakery.mealify.demo` / `partner123`
  (see `server/src/db/seed.js` for every partner's manager email — pattern is
  `manager@<slugified-partner-name>.mealify.demo`)
- **OTP login:** any phone number, code is always `1234` (mocked, printed to the server console)

## Project structure

```
server/
  src/
    db/            schema.sql, migrate.js, seed.js, pool.js
    middleware/     JWT auth
    routes/         auth, partner-auth, partners, listings, orders, payments, addresses, partner dashboard
    utils/          distance calc, JWT helpers, pickup code generator
mobile/
  src/
    theme/          theme.js (single design-system source of truth) + ThemeProvider
    i18n/           i18next setup + locales/en.json, locales/hi.json
    api/            axios client + per-resource API modules
    context/        AuthContext (customer + partner_staff sessions), CartContext
    components/     Button, Card, Badge, Input, ListingCard, PartnerCard, ...
    screens/        onboarding/, auth/, customer/, partner/
    navigation/     Root/Auth/Customer/Partner navigators
```

## Design notes

- **Cart policy:** a cart holds bags from one partner at a time; adding from a different
  partner prompts to clear and start over (see `mobile/src/context/CartContext.js`).
- **Payments:** sandboxed/mocked (`server/src/routes/payments.routes.js`), structured so a real
  gateway (e.g. Razorpay) can be substituted without changing the app's checkout flow.
- **i18n:** add a new Indian language by dropping a `locales/<code>.json` file and registering
  it in `mobile/src/i18n/index.js` — no component changes needed.
