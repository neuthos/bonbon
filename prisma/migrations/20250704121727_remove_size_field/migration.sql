/*
  Warnings:

  - You are about to drop the column `size` on the `Product` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "priceModal" INTEGER NOT NULL,
    "priceJual" INTEGER NOT NULL,
    "link" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Product" ("code", "color", "createdAt", "id", "link", "name", "priceJual", "priceModal") SELECT "code", "color", "createdAt", "id", "link", "name", "priceJual", "priceModal" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
