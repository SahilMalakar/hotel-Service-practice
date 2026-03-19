import { Request, Response } from "express";
import {
  confirmBookingService,
  createBookingService,
} from "../services/booking.service";

export async function createBookingController(req: Request, res: Response) {
  const booking = await createBookingService(req.body);

  res.status(201).json({
    message: "booking created successfully",
    data: booking,
    success: true,
  });
}
export async function confirmBookingController(req: Request, res: Response) {
  const booking = await confirmBookingService(
    req.params.idempotencyKey as string,
  );

  res.status(201).json({
    message: "booking confirmed successfully",
    data: booking,
    success: true,
  });
}
