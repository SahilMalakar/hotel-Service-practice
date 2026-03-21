import { IdempotencyKey, Prisma } from "../prisma/generated/prisma/client";
import { prisma } from "../prisma/prisma";
import { validate as isValidUUID } from "uuid";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";

// Creates a new booking record in the database using Prisma input
export async function createBooking(bookingData: Prisma.BookingCreateInput) {
  return await prisma.booking.create({
    data: bookingData,
  });
}

// 2 approaches

// ---> create booking -> create idempotencykey which will have the access to the booking instance

// ---> create booking ||parallel to create idempotency key ->update the idempotency key to add the booking instances

// Creates an idempotency key and links it to an existing booking via bookingId
export async function createIdempotencyKey(idemKey: string, bookingId: number) {
  if (!bookingId) {
    throw new Error("Booking ID is required");
  }

  return await prisma.idempotencyKey.create({
    data: {
      idemKey,
      bookings: {
        connect: { id: bookingId },
      },
    },
  });
}

// Creates an idempotency key using full Prisma input (more flexible but currently unused)
// export async function createIdempotencyKey(
//   data: Prisma.IdempotencyKeyCreateInput,
// ) {
//   return prisma.idempotencyKey.create({ data });
// }

// Fetches an idempotency key record by its unique key
// export async function getIdempotencyKey(key: string) {
//   return await prisma.idempotencyKey.findUnique({
//     where: {
//       key,
//     },
//   });
// }
export async function getIdempotencyKey(
  tx: Prisma.TransactionClient,
  key: string,
) {
  if (!isValidUUID(key)) {
    throw new BadRequestError("invalid idempotency key format");
  }

  const idempotencyKeyLock: Array<IdempotencyKey> = await tx.$queryRaw`
  SELECT * FROM "IdempotencyKey"
  WHERE "idemKey" = ${key}
  FOR UPDATE
`;
  console.log(`idempotency key with lock : `,idempotencyKeyLock);

  if (!idempotencyKeyLock || idempotencyKeyLock.length === 0) {
    throw new NotFoundError("idempotency key not found");
  }

  return idempotencyKeyLock[0];
}

// Retrieves a booking record by its primary ID
export async function getBookingById(id: number) {
  return await prisma.booking.findUnique({
    where: {
      id,
    },
  });
}

// Updates booking status with validation checks (currently commented out)
// export async function changeBookingStatusById(
//   id: number,
//   status: Prisma.EnumBookingStatusFieldUpdateOperationsInput,
// ) {
//   const booking = await prisma.booking.findUnique({
//     where: {
//       id,
//     }
//   });

//   if (!booking) {
//     throw new Error("Booking not found")
//   }

//   if (booking.status === "CANCELED") {
//     throw new Error("Booking already cancelled")
//   }

//   if (booking.status === "CONFIRMED" && booking.status !== "CANCELED") {
//     throw new Error("Booking already confirmed")
//   }

//   if (booking.status === "PENDING" && booking.status !== "CANCELED") {
//     throw new Error("Booking already in pending")
//   }

//   return await prisma.booking.update({
//     where: {
//       id
//     },
//     data: {
//       status:status
//     }
//   })
// }

// Marks a booking as CONFIRMED based on its ID
export async function confirmBooking(tx: Prisma.TransactionClient, id: number) {
  return await tx.booking.update({
    where: {
      id,
    },
    data: {
      status: "CONFIRMED",
    },
  });
}

// Marks a booking as CANCELED based on its ID
export async function cancelBooking(id: number) {
  return await prisma.booking.update({
    where: {
      id,
    },
    data: {
      status: "CANCELED",
    },
  });
}

// Updates the idempotency key to mark it as finalized
export async function finalizedIdempotencyKey(
  tx: Prisma.TransactionClient,
  idemKey: string,
) {
  return await tx.idempotencyKey.update({
    where: {
      idemKey,
    },
    data: {
      finalized: true,
    },
  });
}
