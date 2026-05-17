import db from '../models/index.js';
import axios from 'axios';
import serverConfig from '../config/serverConfig.js';
import AppError from '../errors/AppError.js';
import BookingRepository from '../repository/booking.repository.js';

const bookingRepository = new BookingRepository();

async function createBooking(data) {
  const transaction = await db.sequelize.transaction();

  try {
    const flight = await axios.get(
      `${serverConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`,
    );

    const flightData = flight.data;

    if (data.noofSeats > flightData.data.totalSeats) {
      reject(new AppError('Not enough seats available', 400));
    }

    const totalBillingAmount = data.noofSeats * flightData.price;
    const bookingPayload = { ...data, totalCost: totalBillingAmount };
    const booking = await bookingRepository.create(bookingPayload, transaction);

    await axios.patch(`${serverConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`, {
      seats: data.noofSeats,
    });

    await transaction.commit();
    return booking;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export default {
  createBooking,
};
