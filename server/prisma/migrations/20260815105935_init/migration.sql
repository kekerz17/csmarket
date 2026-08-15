-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "marketHashName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL,
    "exterior" TEXT,
    "tradable" BOOLEAN NOT NULL DEFAULT true,
    "marketable" BOOLEAN NOT NULL DEFAULT true,
    "priceUsd" REAL,
    "suggestedMarketPrice" REAL,
    "listed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "lastSeenAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "buyerTradeUrl" TEXT NOT NULL,
    "buyerContact" TEXT NOT NULL,
    "priceUsd" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "nowpaymentsInvoiceId" TEXT,
    "nowpaymentsPaymentId" TEXT,
    "tradeOfferId" TEXT,
    "failureReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_assetId_key" ON "Item"("assetId");
