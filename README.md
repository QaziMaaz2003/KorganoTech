# KorganoTech

Full-stack store and admin dashboard for KorganoTech: MERV 11 / MERV 13 pleated HVAC air filters, plus the Pathogen and Environmental filter programs.

| Folder | Stack | Port |
|---|---|---|
| `frontend/` | Next.js 16 (App Router, Cache Components), React 19, Tailwind v4, shadcn/ui (Base UI), TanStack Query | 3000 |
| `backend/` | NestJS 12, Prisma 7 on Supabase Postgres, Cloudinary, JWT cookie auth | 3001 |

The two apps are independent. Each has its own `package.json`, and there is no workspace tooling.

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env      # then fill in the values (see below)
npm install               # also runs `prisma generate`
npm run db:deploy         # apply migrations to the database
npm run db:seed           # categories, products, sizes, settings, admin account
npm run start:dev         # http://localhost:3001/api
```

`backend/.env`:

| Variable | What it is |
|---|---|
| `DATABASE_URL` | Supabase **Session pooler** connection string (Supabase → Connect). URL-encode special characters in the password, e.g. `!` → `%21`. |
| `JWT_SECRET` | 32+ random characters, e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `FRONTEND_URL` | Allowed browser origin(s), comma-separated |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | Cloudinary account used for product images |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin account created by the seed |

API docs (development only): http://localhost:3001/api/docs

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev               # http://localhost:3000
```

Open the site at **http://localhost:3000**. Sign in with the seeded admin account at `/login`, and you land on `/admin`.

## How it works

**Product images.** An admin uploads an image in **Admin → Products → Images**. The NestJS API streams it to Cloudinary under `korganotech/products/<productId>`. It then stores the returned `secure_url` and `public_id` in the `ProductImage` table, and the storefront renders that Cloudinary URL. Deleting an image, or a product, also deletes the file from Cloudinary.

**Catalog.** Each `Product` belongs to one of three categories (`hvac`, `pathogen`, `environmental`). A product has many `ProductVariant`s. Each variant is a size × MERV × pack with its own SKU, price, compare-at price, stock and low-stock threshold. In the admin you can edit variants inline or bulk-generate them as a size × MERV × pack matrix.

**Availability.** Every product has an *Available for purchase* switch. When it is off, the product page shows a **Notify me / Request info** form instead of Add to Cart, and submissions land in **Admin → Inquiries**. Pathogen and Environmental filters ship switched off.

**Cart and checkout (card payment through Stripe).**
- **Cart storage:** guests keep a cart in localStorage, priced by the API. At sign-in it merges into the account cart. A line is either a catalog variant or a custom size.
- **Checkout requires an account:** a shopper can register right on the checkout page.
- **Placing the order:** one database transaction re-prices every line, decrements stock (it fails cleanly if something just sold out), snapshots the items and address, and records stock movements and order history. The order starts `PENDING` / `UNPAID` and the customer is sent to Stripe's hosted checkout page.
- **Paying:** the order is marked **Paid** and moves to `CONFIRMED` when Stripe confirms the payment, either from the `checkout.session.completed` webhook or when the customer returns to the site (the page asks the API to re-check with Stripe, so it works even if a webhook is late). Unpaid orders hold their stock for 45 minutes; if the session expires or the customer cancels, the order is cancelled and restocked. Cancelling a paid order refunds the card automatically.

**Custom-size filters.** `/custom-filters` lets a customer enter exact dimensions (decimals or fractions), depth, MERV rating and pack size and see the price instantly. Price per filter is width × height × a per-square-inch rate (set per depth and MERV in **Admin → Settings → Custom size filters**), with a minimum price and pack discounts. The API re-prices from the current rules at checkout. Custom lines are made to order, so they have no stock; the order keeps the exact specification for the team to build.

**Business accounts.** `/business-account` is a "Request a free business account" form (name, email, phone, company, address, whether they have ordered before, optional filter-list upload up to 4 MB). A request arrives in **Admin → Inquiries** with the file link and a **Create business account** button. That opens **Admin → Businesses**, prefilled, where an admin creates the account and its login (an existing customer is linked; a new one gets a temporary password shown once, to send to the customer), then builds the filter list: catalog sizes or custom sizes, each with a quantity and optional label. The business signs in, opens **Business filters** (`/account/business`), ticks what it needs, adjusts quantities and adds them to the cart, then pays by card as usual. Prices are the same list prices for everyone. There is no email provider yet, so the temporary password is passed on by hand. File uploads need the Cloudinary variables.

**Store policies.** Shipping is to the United States only (the API rejects other countries on saved and checkout addresses), prices are in USD, payment is by card only (no Cash on Delivery), and no sales tax is added at checkout. Returns need a return authorization from Support@korganotech.com. Subscriptions are not offered yet.

**Order status flow:** `PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED`.
- An order can be `CANCELLED` until it ships. Cancelling restocks the items.
- Orders placed before card payments were Cash on Delivery; those are marked **Paid** when delivered. New orders are paid by card before they are confirmed.
- Customers follow every step, plus the carrier and tracking number, under **My orders**.

**Auth.** NestJS issues a JWT in an httpOnly `kt_session` cookie. The browser calls the API through Next's `/api/*` rewrite, so the cookie is first-party. Roles are `CUSTOMER` and `ADMIN`. Logging out or changing a user's access revokes their outstanding tokens. `frontend/src/proxy.ts` redirects signed-out visitors away from `/account` and `/admin`, but the API enforces authorization on every request.

**Supabase security.** Every table has Row Level Security enabled with no policies, and table grants are revoked from the `anon` and `authenticated` roles (see the `init` migration). As a result, Supabase's public REST API can't read store data with the publishable key. Only the NestJS backend, which connects as `postgres`, can.

## Admin dashboard (`/admin`)

| Section | What you can do |
|---|---|
| Dashboard | Sales, cash collected, orders by status, 30-day charts, low stock, top products |
| Orders | Filter and search; confirm / ship (carrier + tracking) / deliver / cancel; set payment status |
| Products | Create, edit, archive or delete; upload and reorder images; manage sizes, prices and stock; toggle *for sale* and *featured* |
| Inventory | Adjust stock with a reason; see each variant's movement history |
| Categories | Edit the three programs' copy and images |
| Customers | View orders, spend and addresses; deactivate accounts or grant admin |
| Inquiries | Contact-sales, notify-me and landfill enquiries |
| Newsletter | Subscribers, with CSV export |
| Settings | Shipping fee, free-shipping threshold, tax rate, online-checkout switch, announcement bar, custom-size pricing rules |

## Pages

- **Home:** layout follows filterking.com.
- **Shopping:** `/shop`, `/shop/sizes`, `/products/[slug]`, `/cart`, `/checkout`.
- **Product programs:** `/hvac-air-filters`, `/pathogen-air-filters`, and `/environmental-air-filters`, which is a port of the Environmental Filters site with its own theme.
- **Company and info:** `/about`, `/technology`, `/resources`, `/faq`, `/contact`, plus the policy pages.
- **Customer account:** `/login`, `/register`, `/account/*`.

Copy from the original korganotech.com lives in `frontend/src/lib/site.ts`. Content for the Environmental page lives in `frontend/src/lib/env-data.ts`.

## Deploying to Vercel

Two Vercel projects from this one repository. Details and reasoning are in [design.md](design.md#10-deploying-on-vercel).

| | Backend | Frontend |
|---|---|---|
| Root Directory | `backend` | `frontend` |
| Framework Preset | **Other** | Next.js |
| Configuration | `backend/vercel.json` (already in the repo) | defaults |

**Backend variables:** `NODE_ENV=production`, `DATABASE_URL` (Supabase **Transaction pooler**, port 6543), `JWT_SECRET`, `JWT_EXPIRES_IN_DAYS`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `FRONTEND_URL`.

**Frontend variables:** `API_URL` (the backend's production address, no trailing slash), `NEXT_PUBLIC_SITE_URL`.

Run `npm run db:deploy` and `npm run db:seed` from your own machine using the **session pooler / direct** connection (port 5432), not the transaction pooler. Deploy the backend first and check `https://<backend>/api/health`, then deploy the frontend. Product images are limited to 4 MB because Vercel rejects larger request bodies.

## Scripts

| Backend | |
|---|---|
| `npm run start:dev` | API with watch mode |
| `npm run build` / `start:prod` | Production build / run |
| `npm run db:migrate` | Create and apply a new migration (development) |
| `npm run db:deploy` | Apply pending migrations |
| `npm run db:seed` | Seed (idempotent) |
| `npm test` | Unit tests |

| Frontend | |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `start` | Production build / run |
| `npm run lint` | ESLint |

## Not yet included

- **Transactional emails:** order confirmations and password resets need an email provider such as Resend.
- **Real content:** product prices and stock are seed placeholders. The policy pages are general templates that need the client's review.
