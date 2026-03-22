import { serverConfig } from "../config";
import { redLock } from "../config/redis.config";
import { Prisma } from "../prisma/generated/prisma/client";
import { prisma } from "../prisma/prisma";
import {
  confirmBooking,
  createBooking,
  createIdempotencyKey,
  getIdempotencyKey,
  finalizedIdempotencyKey,
} from "../repositories/booking.repository";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../utils/errors/app.error";
import { generateIdempotency } from "../utils/helpers/generateIdempotencyKey";
import { CreateBookingInput } from "../utils/schema/types";


// Distributed lock using Redis (manual acquire/release) to prevent concurrent booking conflicts
export async function createBookingService(bookingData: CreateBookingInput) {
  const ttl = serverConfig.LOCK_TTL; // Lock duration (must exceed execution time)

  // Lock key scoped to shared resource (hotel)
  const lockKey = `hotel:${bookingData.hotelId}`;

  let lock;
  try {
    // Acquire Redis distributed lock
    lock = await redLock.acquire([lockKey], ttl);

    console.log(`lock acquired for resource`, lockKey, lock);

    // Create booking record (primary DB write)
    const booking = await createBooking(bookingData);

    // Generate idempotency key for request tracking
    const idempotencyKey = generateIdempotency();

    // Persist idempotency key linked to booking
    await createIdempotencyKey(idempotencyKey, booking.id);

    // Return minimal response to client
    return {
      bookingId: booking.id,
      idempotencyKey,
    };
  } catch (err: any) {
    console.error("❌ Booking failed:", err);

    throw new InternalServerError(
      "Failed to acquired lock for booking resources",
    );
  } 
}

// Pessimistic Locking --> Lock row immediately
// this solve the multiple parallel request (conqurency) for signle users
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
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );
  } catch (error: any) {
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
