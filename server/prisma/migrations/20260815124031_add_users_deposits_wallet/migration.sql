/*
  Warnings:

  - You are about to drop the column `buyerContact` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `buyerTradeUrl` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `nowpaymentsInvoiceId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `nowpaymentsPaymentId` on the `Order` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "steamId64" TEXT NOT NULL,
    "personaName" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "tradeUrl" TEXT,
    "balanceUsd" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Deposit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amountUsd" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "nowpaymentsInvoiceId" TEXT,
    "nowpaymentsPaymentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "priceUsd" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PAID',
    "tradeOfferId" TEXT,
    "failureReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("createdAt", "failureReason", "id", "itemId", "priceUsd", "status", "tradeOfferId", "updatedAt") SELECT "createdAt", "failureReason", "id", "itemId", "priceUsd", "status", "tradeOfferId", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_steamId64_key" ON "User"("steamId64");
