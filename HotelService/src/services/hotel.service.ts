import {
  createHotel,
  getAllHotels,
  getHotelById,
  softDeleteHotel,
} from "../repositories/hotel.repository";
import { CreateHotelInput } from "../utils/schema/types";

export async function createHotelService(hotelData: CreateHotelInput) {
  const hotel = await createHotel(hotelData);
  return hotel;
}

export async function getHotelByIdService(id: number) {
  const hotel = await getHotelById(id);
  return hotel;
}

export async function getAllHotelService() {
  const hotel = await getAllHotels();
  return hotel;
}

export async function softDeleteHotelByIdService(id: number) {
  await softDeleteHotel(id);
  return true;
}
