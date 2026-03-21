import { Prisma } from "../prisma/generated/prisma/client";
import { prisma } from "../prisma/prisma";
import {
  confirmBooking,
  createBooking,
  createIdempotencyKey,
  getIdempotencyKey,
  finalizedIdempotencyKey,
} from "../repositories/booking.repository";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import { generateIdempotency } from "../utils/helpers/generateIdempotencyKey";
import { CreateBookingInput } from "../utils/schema/types";


export async function createBookingService(bookingData: CreateBookingInput) {
  // Create booking first (core business operation)
  const booking = await createBooking(bookingData);

  // Generate unique idempotency key for this booking
  const idempotencyKey = generateIdempotency();

  // Link idempotency key with created booking
  await createIdempotencyKey(idempotencyKey, booking.id);

  // Return minimal response needed by client
  return {
    bookingId: booking.id,
    idempotencyKey: idempotencyKey,
  };
}


// Pessimistic Locking --> Lock row immediately
export async function confirmBookingService(idempotencyKey: string) {
  try {
    return await prisma.$transaction(
      async (tx) => {
        const idempotencyKeyData = await getIdempotencyKey(tx, idempotencyKey);
  
        if (!idempotencyKeyData || !idempotencyKeyData.bookingId) {
          throw new NotFoundError("Idempotency key not found");
        }
  
        if (idempotencyKeyData.finalized) {
          throw new BadRequestError("Idempotency key already finalized");
        }
  
        const booking = await confirmBooking(tx, idempotencyKeyData.bookingId);
  
        await finalizedIdempotencyKey(tx, idempotencyKey);
        return booking;
      },
    );
  } catch (error :any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2028 → transaction already closed
      if (error.code === "P2028") {
        console.error("❌ Transaction closed unexpectedly");

        throw new BadRequestError(
          "Transaction failed due to timeout or concurrency issue. Please retry.",
        );
      }

      // Optional: handle other Prisma errors
      if (error.code === "P2002") {
        throw new BadRequestError("Unique constraint failed");
      }
    }

    // fallback
    throw error;
  }
}

// export async function confirmBookingService(idempotencyKey: string) {
//   // Fetch idempotency record to validate request state
//   const idempotencyKeyData = await getIdempotencyKey(idempotencyKey);

//   // Ensure idempotency key exists before proceeding
//   if (!idempotencyKeyData) {
//     throw new NotFoundError("Idempotency key not found");
//   }

//   // Prevent duplicate processing of same request
//   if (idempotencyKeyData.finalized) {
//     throw new BadRequestError("Idempotency key already finalized");
//   }

//   // Ensure booking is linked to this idempotency key
//   if (!idempotencyKeyData.bookingId) {
//     throw new BadRequestError("No booking associated with this key");
//   }

//   // Confirm booking using linked booking ID
//   const booking = await confirmBooking(idempotencyKeyData.bookingId);

//   // Mark idempotency key as finalized to prevent reprocessing
//   await finalizedIdempotencyKey(idempotencyKey);

//   return booking;
// }
