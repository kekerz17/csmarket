-- CreateTable
CREATE TABLE "SellOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "marketHashName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL,
    "exterior" TEXT,
    "marketPriceUsd" DOUBLE PRECISION NOT NULL,
    "payoutUsd" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_TRANSFER',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SellOrder" ADD CONSTRAINT "SellOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
