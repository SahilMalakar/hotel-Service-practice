import { Router } from "express";
import { validateBody } from "../../middlewares/validator.middlewares";
import { createBookingSchema } from "../../utils/schema/types";
import {
  confirmBookingController,
  createBookingController,
} from "../../controllers/booking.controllers";

const bookingRouter: Router = Router();

bookingRouter.post(
  "/bookings",
  validateBody(createBookingSchema),
  createBookingController,
);

bookingRouter.post(
  "/bookings/:idempotencyKey",
  confirmBookingController
);

export { bookingRouter };
