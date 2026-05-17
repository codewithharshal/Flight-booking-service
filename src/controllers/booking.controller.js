import { success } from '../errors/response/successResponse.js';
import { error as errorResponse } from '../errors/response/errorResponse.js';
import bookingService from '../services/booking.service.js';

async function createBooking(req, res) {
  try {
    console.log('body', req.body);
    const response = await bookingService.createBooking({
      flightId: req.body.flightId,
      userId: req.body.userId,
      noofSeats: req.body.noofSeats,
    });
    success.data = response;
    return res.status(200).json(success);
  } catch (error) {
    errorResponse.error = error;
    return res.status(500).json(errorResponse);
  }
}

async function makePayment(req, res) {
  try {
    const response = await bookingService.makePayment({
      totalCost: req.body.totalCost,
      userId: req.body.userId,
      bookingId: req.body.bookingId,
    });
    success.data = response;
    return res.status(200).json(success);
  } catch (error) {
    errorResponse.error = error;
    return res.status(501).json(errorResponse);
  }
}

export default {
  createBooking,
  makePayment,
};
