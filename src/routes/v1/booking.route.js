import express from 'express';

import bookingController from '../../controllers/booking.controller.js';

const Bookingrouter = express.Router();

Bookingrouter.post('/', bookingController.createBooking);
Bookingrouter.post('/payment', bookingController.makePayment);

export default Bookingrouter;
