import { z } from "zod";

export const createHotelSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),

  address: z.string().min(5, "Address too short").max(255),

  location: z.string().min(2).max(100),
});

export type CreateHotelInput = z.infer<typeof createHotelSchema>;

export const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});