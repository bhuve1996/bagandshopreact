import "dotenv/config";
import {
  disconnectCatalogImport,
  importCatalogFromRepo,
} from "./catalog-import";

importCatalogFromRepo()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => disconnectCatalogImport());
