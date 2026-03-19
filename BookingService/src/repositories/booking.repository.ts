import { Prisma } from "../prisma/generated/prisma/client";
import { prisma } from "../prisma/prisma";

export async function createBooking(bookingData: Prisma.BookingCreateInput) {
  return await prisma.booking.create({
    data: bookingData,
  });
}
