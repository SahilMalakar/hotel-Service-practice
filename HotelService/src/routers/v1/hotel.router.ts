import { Router } from "express";
import {
  createHotelControllers,
  getAllHotelsControllers,
  getHotelByIdControllers,
  softDeleteHotelbyIdControllers,
} from "../../controllers/hotel.controller";
import {
  validateBody,
  validateParams,
} from "../../middlewares/validator.middlewares";
import { createHotelSchema, idSchema } from "../../utils/schema/types";

const hotelRouter: Router = Router();

hotelRouter.post(
  "/hotels",
  validateBody(createHotelSchema),
  createHotelControllers, 
);

hotelRouter.get(
  "/hotels/:id",
  validateParams(idSchema),
  getHotelByIdControllers,
);

hotelRouter.get("/hotels", getAllHotelsControllers);

hotelRouter.delete(
  "/hotels/:id",
  validateParams(idSchema),
  softDeleteHotelbyIdControllers,
);

export { hotelRouter };
