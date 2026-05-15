const { StatusCodes } = require('http-status-codes');

const { Booking } = require('../models');
const CrudRepository = require('./crud-repository');

export default class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }
}
