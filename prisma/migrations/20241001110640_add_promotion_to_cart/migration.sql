-- CreateTable
CREATE TABLE "PromotionAppliedOnCart" (
    "id" SERIAL NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promotionId" INTEGER NOT NULL,
    "cartId" INTEGER NOT NULL,

    CONSTRAINT "PromotionAppliedOnCart_pkey" PRIMARY KEY ("promotionId","cartId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromotionAppliedOnCart_id_key" ON "PromotionAppliedOnCart"("id");

-- AddForeignKey
ALTER TABLE "PromotionAppliedOnCart" ADD CONSTRAINT "PromotionAppliedOnCart_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionAppliedOnCart" ADD CONSTRAINT "PromotionAppliedOnCart_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
