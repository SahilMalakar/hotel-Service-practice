import { Request, Response } from "express";
import { createHotelService, getAllHotelService, getHotelByIdService, softDeleteHotelByIdService } from "../services/hotel.service";

export async function createHotelControllers(req: Request, res: Response) {
    const hotel = await createHotelService(req.body);
    

    return res.status(201).json({
        message: "hotel created successfully",
        data: hotel,
        success:true
  });
}

export async function getHotelByIdControllers(req: Request, res: Response) {
    const { id } = req.params;
     
    const hotel = await getHotelByIdService(id as any);

    return res.status(200).json({
      message: "hotel fetched successfully",
      data: hotel,
      success: true,
    });
}

export async function getAllHotelsControllers(req: Request, res: Response) {
  const hotel = await getAllHotelService();

  return res.status(200).json({
    message: "hotels fetched successfully",
    data: hotel,
    success: true,
  });
}

export async function softDeleteHotelbyIdControllers(req: Request, res: Response) {
  await softDeleteHotelByIdService(req.params.id as any);

  return res.status(200).json({
    message: "hotels deleted successfully",
    success: true,
  });
}