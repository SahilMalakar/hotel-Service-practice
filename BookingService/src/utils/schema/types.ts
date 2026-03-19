import { z } from "zod";

export const createBookingSchema = z.object({
  userId: z.coerce.number().int().positive(),
  hotelId: z.coerce.number().int().positive(),
  totalGuest: z.coerce.number().int().min(1).max(10),
  bookingAmount: z.coerce.number().positive(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
