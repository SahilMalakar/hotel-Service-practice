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


// export async function createBookingService(bookingData: CreateBookingInput) {
//   // Create booking first (core business operation)
//   const booking = await createBooking(bookingData);

//   // Generate unique idempotency key for this booking
//   const idempotencyKey = generateIdempotency();

//   // Link idempotency key with created booking
//   await createIdempotencyKey(idempotencyKey, booking.id);

//   // Return minimal response needed by client
//   return {
//     bookingId: booking.id,
//     idempotencyKey: idempotencyKey,
//   };
// }

export async function createBookingService(bookingData: CreateBookingInput) {
  console.log("🚀 [SERVICE] createBookingService START");

  try {
    console.log("📥 [SERVICE] Input:", bookingData);

    console.log("📦 [SERVICE] Calling createBooking...");
    const booking = await createBooking(bookingData);
    console.log("✅ [SERVICE] Booking created:", booking);

    console.log("🔑 [SERVICE] Generating idempotency key...");
    const idempotencyKey = generateIdempotency();
    console.log("✅ [SERVICE] Idempotency key:", idempotencyKey);

    console.log("🔗 [SERVICE] Linking idempotency key...");
    await createIdempotencyKey(idempotencyKey, booking.id);
    console.log("✅ [SERVICE] Idempotency key linked");

    console.log("🎉 [SERVICE] SUCCESS");

    return {
      bookingId: booking.id,
      idempotencyKey: idempotencyKey,
    };
  } catch (err: any) {
    console.error("❌ [SERVICE] FAILED");
    console.error("👉 Message:", err.message);
    console.error("👉 Code:", err.code);
    console.error("👉 Stack:", err.stack);
    throw err;
  }
}

// Pessimistic Locking --> Lock row immediately
export async function confirmBookingService(idempotencyKey: string) {
  return await prisma.$transaction(async (tx) => {

    const idempotencyKeyData = await getIdempotencyKey(tx ,idempotencyKey);

    if (!idempotencyKeyData || !idempotencyKeyData.bookingId) {
      throw new NotFoundError("Idempotency key not found");
    }

    if (idempotencyKeyData.finalized) {
      throw new BadRequestError("Idempotency key already finalized");
    }

    const booking = await confirmBooking(tx ,idempotencyKeyData.bookingId);

    await finalizedIdempotencyKey(tx ,idempotencyKey);
    return booking;
  });
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
