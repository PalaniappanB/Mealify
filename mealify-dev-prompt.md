# Build "Mealify" — Full-Stack Surplus Food Marketplace App (India)

## Project Overview
Build **Mealify**, a mobile-first surplus food marketplace for the Indian market. Restaurants, cafés, and bakeries ("partners") list unsold surplus food as discounted time-boxed listings ("Mealify Bags"). Customers browse nearby listings, add to cart, and pay in-app for pickup.

Build this as a **complete, working, end-to-end app** — from login through browse, cart, checkout, and payment confirmation — using **seeded database data**, not hardcoded/mocked frontend data.

Do **not** copy the visual style, layout patterns, or naming conventions of existing surplus-food apps (Too Good To Go, Olio, Karma, Fozo, Good to Grab, Plenti, Yindii). Mealify must look and feel like its own product — see "Design Language" section below for direction.

---

## Tech Stack (fixed — do not substitute)
- **Frontend:** React Native (Expo)
- **Backend:** Node.js (Express)
- **Database:** PostgreSQL

---

## Architecture Requirements

### 1. Multi-client (multi-tenant) support
- The system must support **multiple restaurant/partner accounts** ("clients"), each with their own:
  - Profile (name, address, lat/long, cuisine type, logo)
  - Independent set of listings ("bags") with price, quantity, pickup window, and expiry
  - Own order queue and basic dashboard view (can be a simple web or in-app partner view)
- Partners must be logically isolated in the data model — one partner must never see another partner's orders or inventory.

### 2. Multi-customer support
- Standard customer accounts: registration, login, profile, saved addresses/pickup preference, order history.
- Many customers can browse and order from many partners concurrently — build this as a true many-to-many marketplace, not a single-vendor app.

### 3. One centralized stylesheet (design system, not scattered styles)
- All colors, spacing, typography, border-radius, shadows, and component variants must live in **one central theme/style file** (e.g. `theme.js` or `styles/theme.ts`) consumed everywhere via a theme provider or shared constants — not inline styles or per-screen duplicated style objects.
- Every screen and component pulls from this single source of truth so the whole app can be restyled by editing one file.

### 4. Multi-language support (i18n)
- Implement i18n (e.g. `i18next` / `react-i18next`) with at least **English and Hindi** translation files to start, structured so additional Indian languages (Tamil, Telugu, Kannada, Bengali, Marathi) can be added by just adding new JSON translation files — no hardcoded UI strings anywhere in components.
- Include a language switcher in settings/profile.

### 5. Responsive design
- All screens must adapt cleanly across phone screen sizes (small Android budget phones through large phones) and tablets — use flexible layouts (Flexbox, percentage/relative units, `useWindowDimensions`), not fixed pixel dimensions.

### 6. Dummy data must come from the database
- Seed PostgreSQL with realistic dummy data via a seed script (partners, listings, customers, orders) — the frontend must fetch this through real API calls to the Node.js backend, not local mock JSON in the app.
- Seed data should include multiple partners across a few Indian cities, varied cuisine types, varied listing prices/discounts, and a few customers with order history.

---

## Database Schema (PostgreSQL) — minimum tables
- `users` (customers): id, name, email, phone, password_hash, preferred_language, created_at
- `partners`: id, name, cuisine_type, address, latitude, longitude, logo_url, is_active, created_at
- `partner_staff` (optional, for partner dashboard login): id, partner_id, name, email, password_hash
- `listings` (Mealify Bags): id, partner_id, title, description, original_price, discounted_price, quantity_available, pickup_window_start, pickup_window_end, expires_at, status
- `orders`: id, user_id, partner_id, status, total_amount, payment_status, created_at
- `order_items`: id, order_id, listing_id, quantity, price_at_purchase
- `payments`: id, order_id, provider, provider_payment_id, amount, status, created_at
- `addresses` (optional): id, user_id, label, address_text, latitude, longitude

Use foreign keys and cascading rules appropriately to keep partner/customer data properly isolated.

---

## Core Feature Flow (must all work end-to-end)

1. **Onboarding & Auth**
   - Splash → language selection (first launch) → login/signup (email or phone + OTP-style flow, can be mocked for MVP) → home
2. **Browse**
   - Home feed of nearby active listings (use seeded lat/long + simple distance calculation)
   - Filter by cuisine type, price range, pickup time
   - Partner detail page showing all active listings from that partner
3. **Cart**
   - Add/remove listings, adjust quantity within available stock, see live subtotal
   - Cart must respect per-partner grouping (if listings from multiple partners are in cart, group order per partner or restrict cart to one partner at a time — pick one approach and implement consistently)
4. **Checkout & Payment**
   - Review order → select/confirm pickup window → payment screen
   - Integrate a **sandbox/test-mode payment flow** (structure the payment service layer so it could plug into Razorpay in production, but a mocked/test provider is fine for this build) → order confirmation screen with pickup code/QR
5. **Order history**
   - Customers can view past and active orders with status (placed, ready for pickup, completed, cancelled)
6. **Partner-side minimal dashboard**
   - Simple screen/view for a partner to see and manage their own listings and incoming orders

---

## Design Language (make it visually distinct)
- Do not use the "green + white eco/leaf" palette common to food-waste apps — choose a different, original color direction (e.g. warm terracotta/turmeric tones, or a bold contemporary palette) that still feels food-forward and trustworthy.
- Avoid the generic "surprise bag" iconography used by competitors — design original iconography/illustration style for listings.
- Typography and component shapes (buttons, cards, badges) should feel like a distinct, considered brand system, not a template clone.

---

## Deliverables
- Working Expo React Native app (iOS + Android via Expo Go or dev build)
- Node.js/Express API with all endpoints needed for the above flows
- PostgreSQL schema + seed script producing realistic multi-partner, multi-customer dummy data
- Central theme file, i18n setup with English + Hindi, responsive layouts throughout
