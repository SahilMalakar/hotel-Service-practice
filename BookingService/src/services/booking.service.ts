import { createBooking } from "../repositories/booking.repository";

export async function createBookingService(bookingData:any) {
    return await createBooking(bookingData)
}

export async function finalizeBookingService() {
    
}