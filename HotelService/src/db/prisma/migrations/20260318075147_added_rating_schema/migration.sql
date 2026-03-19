-- CreateTable
CREATE TABLE "Ratings" (
    "id" SERIAL NOT NULL,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    "hotelId" INTEGER NOT NULL,

    CONSTRAINT "Ratings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ratings" ADD CONSTRAINT "Ratings_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
