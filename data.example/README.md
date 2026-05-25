# Example data layout

Copy this folder to `data/` at the project root (or create `data/` manually):

```
data/
  products_export.csv       # Shopify export
  scraped-data/             # optional — see docs/DATA.md
    website-data.json
    assets/images/
```

Then run `npm run db:import`.
