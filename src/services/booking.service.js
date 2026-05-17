import db from '../models/index.js';
import axios from 'axios';
import serverConfig from '../config/serverConfig.js';
import AppError from '../errors/AppError.js';

async function createBooking(data) {
  return new Promise((resolve, reject) => {
    const result = db.sequelize.transaction(async function bookingImpl(t) {
      const flight = await axios.get(
        `${serverConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`,
      );

      const flightData = flight.data;

      console.log(data.noofSeats, flightData.data.totalSeats);

      if (data.noofSeats > flightData.data.totalSeats) {
        reject(new AppError('Not enough seats available', 400));
      }
      resolve(true);
    });
  });
}

export default {
  createBooking,
};
