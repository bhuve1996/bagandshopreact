# Bag & Shop

Premium design-led ecommerce storefront inspired by [DailyObjects](https://www.dailyobjects.com).

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind v4
- **Prisma 7** + PostgreSQL
- **NextAuth** · **Zustand** · **TanStack Query**
- **Resend** · **Algolia** (optional) · **Razorpay** (optional)

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

### Database

```bash
docker compose up -d
npm run db:sync
```

(`db:sync` = `db:push` → `db:import` → `db:seed`)

### Catalog (database)

The storefront reads **products, categories, banners, and coupons from Postgres** (manage in `/admin`). Initial data is seeded from:

- `prisma/catalog.json` — bootstrap product metadata
- `public/products/{slug}/` — product image files (deployed with the app)

```bash
npm run db:sync   # push schema → import catalog → seed users/coupons/banner
```

**Vercel Blob** (optional): add Blob storage on Vercel for admin uploads (`BLOB_READ_WRITE_TOKEN`). Without it, uploads save to `public/uploads/` locally only.

See [docs/DATA.md](docs/DATA.md).

## Demo accounts

| Email | Password | Role |
|-------|----------|------|
| customer@test.com | password123 | Customer |
| admin@test.com | admin123 | Super Admin |

**Coupons:** `WELCOME10` · `FLAT200`  
**Referral codes:** `CUST2024` · `ADMIN2024` (₹150 off at checkout)

## All phases

| Phase | Features |
|-------|----------|
| 1–3 | Storefront, APIs, PLP/PDP, auth, checkout, wishlist |
| 4 | Admin panel (products, orders, coupons, banners, users) |
| 5 | Analytics dashboard, Resend emails |
| 6 | Algolia search, Razorpay, recommendations |
| **7** | **Reviews**, **SEO** (sitemap/JSON-LD), **abandoned cart** emails, **referrals**, **dynamic banners**, **shop assistant**, **recently viewed**, **Docker + CI** |

## Phase 7 highlights

- **Reviews** — submit on PDP, admin moderation at `/admin/reviews`
- **SEO** — `/sitemap.xml`, `/robots.txt`, Product JSON-LD schema
- **Abandoned cart** — auto-save cart + cron email (`GET /api/cron/abandoned-cart` with `Authorization: Bearer $CRON_SECRET`)
- **Referrals** — unique codes on account page, discount at checkout
- **CMS banners** — hero carousel loads from DB via `/api/banners`
- **Shop assistant** — floating help widget (shipping, returns, tracking)
- **Recently viewed** — persisted on homepage
- **Deploy** — `Dockerfile` with standalone output, GitHub Actions CI

## Admin

[http://localhost:3000/admin](http://localhost:3000/admin) — `admin@test.com` / `admin123`

| Section | Manage |
|---------|--------|
| **Products** | Edit/create with variants, images, flags, category, marketing collection |
| **Categories** | Create, edit, delete (when empty), name/slug/description/image |
| **Collections** | Create, edit, delete (when empty), marketing collections |
| **Orders** | Status & payment updates |
| **Reviews** | Approve / reject |
| **Banners** | Homepage carousel CMS |
| **Coupons** | Promo codes |

## Cron (abandoned cart)

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/abandoned-cart
```

Schedule hourly in production (Vercel Cron, GitHub Actions, etc.).

## Docker

```bash
docker compose up -d
npm run db:push && npm run db:seed
docker build -t bag-and-shop .
docker run -p 3000:3000 --env-file .env bag-and-shop
```

## Scripts

- `npm run dev` · `npm run build` · `npm run lint`
- `npm run db:push` · `npm run db:seed` · `npm run db:studio`
