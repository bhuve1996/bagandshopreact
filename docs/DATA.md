# Catalog & media

## Runtime source of truth: **database**

Products, categories, collections, banners, coupons, and homepage videos are stored in **Postgres** and edited in the **admin panel**. The storefront never reads `catalog.json` at runtime.

## Bootstrap (first deploy / fresh DB)

| Path | Purpose |
|------|---------|
| `prisma/catalog.json` | One-time seed input for `db:import` / `db:seed` |
| `public/products/{slug}/` | Product images at `/products/{slug}/...` (commit to git) |

```bash
npm run db:sync
```

(`db:seed` runs the catalog import, then users, coupons, hero banner, and videos.)

## Admin uploads (production)

On Vercel, create a **Blob** store and connect it to the project. The SDK uses `BLOB_READ_WRITE_TOKEN` for images/videos uploaded in Admin → Media.

Locally, omit the token — files go to `public/uploads/` (gitignored).

## Adding products

1. Add images under `public/products/your-slug/`
2. Add the product in `prisma/catalog.json`
3. Run `npm run db:import` (or `db:seed` / `db:sync`)
4. Further edits via **Admin → Products** (stored in DB)
