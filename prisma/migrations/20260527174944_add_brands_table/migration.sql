-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "initials" VARCHAR(10) NOT NULL,
    "color" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE INDEX "brands_is_active_idx" ON "brands"("is_active");

-- CreateIndex
CREATE INDEX "brands_sort_order_idx" ON "brands"("sort_order");
