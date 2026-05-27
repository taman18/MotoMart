-- CreateTable
CREATE TABLE "parts" (
    "id" TEXT NOT NULL,
    "sku" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" VARCHAR(50) NOT NULL,
    "brand" VARCHAR(50) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "mrp" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "min_stock" INTEGER NOT NULL DEFAULT 10,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "compatible_bikes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_sale" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parts_sku_key" ON "parts"("sku");

-- CreateIndex
CREATE INDEX "parts_category_idx" ON "parts"("category");

-- CreateIndex
CREATE INDEX "parts_brand_idx" ON "parts"("brand");

-- CreateIndex
CREATE INDEX "parts_is_featured_idx" ON "parts"("is_featured");
