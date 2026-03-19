import logger from "../config/logger.config";
import { prisma } from "../db/lib/prisma";
import { NotFoundError } from "../utils/errors/app.error";
import { CreateHotelInput } from "../utils/schema/types";
import { Prisma } from "../db/generated/prisma/client";

//  Create Hotel
export async function createHotel(hotelData: CreateHotelInput) {
  const hotel = await prisma.hotels.create({
    data: {
      name: hotelData.name,
      address: hotelData.address,
      location: hotelData.location,
    },
  });

  logger.info({
    message: "hotel created",
    data: { id: hotel.id },
  });

  return hotel;
}

//  Get Hotel By ID (with soft delete filter)
export async function getHotelById(id: number) {
  const hotel = await prisma.hotels.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!hotel) {
    logger.info({
      message: "hotel not found",
      data: { id },
    });
    throw new NotFoundError(`hotel not found : ${id}`);
  }

  logger.info({
    message: "hotel found",
    data: { id },
  });

  return hotel;
}

//  Get All Hotels (only non-deleted)
export async function getAllHotels() {
  const hotels = await prisma.hotels.findMany({
    where: {
      deletedAt: null,
    },
  });

  logger.info({
    message: "hotels fetched",
    data: { count: hotels.length },
  });

  return hotels;
}

//  Soft Delete Hotel (optimized single query)
export async function softDeleteHotel(id: number) {
  try {
    const hotel = await prisma.hotels.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    logger.info({
      message: "hotel soft deleted",
      data: { id: hotel.id },
    });

    return hotel;
  } catch (error:any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        logger.info({
          message: "hotel not found",
          data: { id },
        });

        throw new NotFoundError(`hotel not found : ${id}`);
      }
    }

    throw error;
  }
}
