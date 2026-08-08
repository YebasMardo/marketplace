# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A multi-vendor marketplace: NestJS + MongoDB (Mongoose) API in `backend/`, React 19 + Vite + Redux Toolkit (RTK Query) SPA in `frontend/`, Redis for cart/session state, Stripe for card payments, Cloudinary for images, Resend for transactional email.

**`docs/backend-dossier-technique.html`** (French) is the authoritative design document for this project — data models, auth flow, full API reference, business flows (checkout → order splitting, order status machine, Stripe webhook flow, cash payments, digital delivery), and the rationale behind past bug fixes. Source comments throughout the backend reference it directly (e.g. "§4 du dossier technique"). Read the relevant section before making non-trivial changes to auth, orders, payments, or cart — it explains *why*, not just *what*.

Code comments in this repo are a mix of French and English; follow the existing convention per file rather than normalizing it.

## Commands

### Backend (`backend/`)
```
npm run start:dev       # watch mode, http://localhost:3000
npm run build            # nest build
npm run lint              # eslint --fix
npm run format            # prettier --write
npm run test               # jest unit tests (*.spec.ts, colocated with source)
npm run test -- users.service.spec  # run a single test file (by name pattern)
npm run test:watch
npm run test:cov
npm run test:e2e           # jest --config ./test/jest-e2e.json (test/*.e2e-spec.ts)
```

### Frontend (`frontend/`)
```
npm run dev        # vite dev server, http://localhost:5173
npm run build       # tsc -b && vite build
npm run lint          # eslint .
npm run preview
```

### Full stack (Docker)
```
docker compose up --build   # redis + backend (:3000) + frontend (:5173, nginx)
```
Requires a root `.env` (see `.env.example`): `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `CLOUDINARY_*`, `STRIPE_*`, `RESEND_API_KEY`, `EMAIL_FROM`, `VITE_API_URL`. Vite reads env from the repo root (`envDir: '../'` in `vite.config.ts`), not from `frontend/`.

There is no top-level script that runs both apps together outside Docker — run `backend` and `frontend` dev servers in separate terminals.

## Architecture

### Backend module graph
Standard NestJS feature-module layout under `backend/src/`: `auth`, `users`, `products`, `categories`, `cart`, `orders`, `payments`, `upload`, `email`, `redis`, plus `common/` for cross-cutting guards/decorators. `AppModule` wires them all; `MongooseModule.forRootAsync` builds the Mongo URI from `ConfigService` (never hardcode it — it differs between local and Docker).

Dependency direction matters and is deliberately one-way in a few places to avoid module cycles — e.g. `ProductsModule` imports the `Category` *schema* directly instead of `CategoriesModule`, because `CategoriesModule` already depends on `ProductsModule`. Check for this pattern before adding a new cross-module import.

- **Auth**: JWT (`@nestjs/passport` + `passport-jwt`). `JwtStrategy.validate()` also checks a Redis blacklist key (`auth:blacklist:<token>`) — logout writes the token there with a TTL matching its remaining expiry, since JWTs otherwise can't be revoked before they expire. `JwtAuthGuard` (authentication) and `RolesGuard` + `@Roles()` (authorization, checked against `req.user.role`) are separate guards, both applied per-route.
- **Cart**: lives entirely in Redis (`cart:<userId>`, TTL 7 days), not Mongo — it's a `{productId: quantity}` map that gets enriched with *live* product data (title/price/images/type) on every read, and silently drops line items whose product was deleted/suspended. `price` on a cart item is always what gets charged (`promoPrice` if set and lower); `originalPrice` is only present to show a strikethrough. `type` is echoed purely so the checkout form knows whether to require a postal address.
- **Orders**: `OrdersService.checkout()` splits one cart into multiple `Order` documents, grouped by `sellerId + fulfillmentType` (physical/digital never mix in one order) — see `OrderGroup` in `orders.service.ts`. Stock is decremented per physical item during checkout and explicitly rolled back (`releaseReservations`) if checkout fails *before* orders are persisted; once orders exist, cancellation is the only path back to restoring stock. Order status is a state machine: `pending_payment → processing → shipped → delivered` (physical) or `pending_payment → completed` (digital, immediate), with `cancelled` reachable only from the two pre-shipping states. `markAsPaid()` is the single entry point that transitions out of `pending_payment`, called from both the Stripe webhook and the seller's manual cash-payment confirmation — it must stay idempotent (Stripe can redeliver webhooks).
- **Payments**: Stripe webhook route (`POST /payments/webhook`) has no `JwtAuthGuard` — Stripe calls it directly, and signature verification inside `PaymentsService.handleWebhook()` (using `req.rawBody`, enabled via `NestFactory.create(AppModule, { rawBody: true })`) is the only security on that route. Don't add auth guards there or verification will double up incorrectly.
- **Products**: `type: 'physical' | 'digital'` determines which optional fields apply (`stock`/`weightGrams`/`shippingOptions` vs `fileKey`/`downloadLimit`) — there's no schema-level enforcement that the "wrong" set is absent, so services must branch on `type` before touching them.
- **Order line items** are snapshots (title/price frozen at purchase), deliberately never re-read live from `Product` — a later price change must not rewrite order history.
- **Shipping details** (`ShippingDetails` on `Order`) follow the same snapshot rule and are captured per checkout — nothing is stored on `User`. Contact (`fullName`/`email`/`phone`) is always required; the postal fields are optional in `ShippingDetailsDto` and enforced by `OrdersService.assertDeliverable()` instead, because the DTO is validated before the cart is read and therefore can't yet know whether anything physical is being bought. Every order split out of one cart carries its own copy. `shipping` is deliberately *not* `required` in the schema: pre-existing orders lack it, and Mongoose validates the whole document on `save()`, so requiring it would break `cancel()`/`markAsShipped()` on old orders — always guard on its presence when reading. Digital delivery email still goes to the *account* email, never `shipping.email`.

### Frontend structure
`frontend/src/`:
- `features/<domain>/` — one RTK Query API slice per backend module (`authApi.ts`, `cartApi.ts`, `productsApi.ts`, etc.), injected into a single `api` (`lib/apiClient.ts`) via `api.injectEndpoints()`. Tag types (`Me`, `Product`, `Category`, `Cart`, `Order`) drive cache invalidation across features.
- `lib/apiClient.ts` — the base RTK Query client. A 401 response anywhere triggers `dispatch(logout())` globally (no refresh-token flow exists server-side, so 401 always means "session over," never "retry").
- `app/store.ts` — Redux store: `api` reducer + `auth` slice (JWT token, persisted to `localStorage`) + `wishlist` slice (client-only, `localStorage`, no backend — a visitor can build a wishlist while logged out).
- `routes/router.tsx` — `createBrowserRouter` tree. Auth pages (`/login`, `/register`) sit outside the shared `Layout` (they're full-screen, no header/footer). Route guards are composed as wrapper routes: `ProtectedRoute` (any authenticated user, checks Redux token) and `RoleRoute` (role-gated via `useGetMeQuery`, `allowed: Role[]`) rather than per-page checks.
- `pages/` split by audience: `public/`, `buyer/`, `seller/`, `admin/` — mirrors the role model (`admin` | `seller` | `buyer`) used throughout the backend.

Styling is Tailwind CSS v4 via `@tailwindcss/vite` (no separate `tailwind.config.js` — v4 configures through CSS). Forms use `react-hook-form` + `zod` (`lib/schemas.ts`) + `@hookform/resolvers`.

## Conventions worth preserving

- Backend DTOs use `class-validator`; the global `ValidationPipe` (`main.ts`) has `whitelist` + `forbidNonWhitelisted` on, so any new DTO field must be explicitly decorated or requests carrying it will be rejected.
- Services throw Nest's HTTP exceptions (`NotFoundException`, `ForbiddenException`, `BadRequestException`, etc.) directly rather than returning error objects — controllers stay thin.
- Cross-cutting failures that shouldn't block the primary operation (welcome email on register, digital-delivery email per order item) are caught and logged, not propagated — the account/order still needs to exist even if the email fails.
- `@nestjs/mongoose` schemas keep business-rule comments inline (e.g. why `OrderItem` has `_id: false`, why `imageUrl` needs an explicit `type: String`) — read them before modifying a schema.
