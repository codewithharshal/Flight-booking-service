import CrudRepository from './crud.repository.js';
import db from '../models/index.js';
import AppError from '../errors/AppError.js';

export default class BookingRepository extends CrudRepository {
  constructor() {
    super(db.Booking);
  }

  async createBooking(data, transaction) {
    const response = await db.Booking.create(data, { transaction: transaction });
    return response;
  }

  async get(data, transaction) {
    const response = await this.model.findByPk(data, { transaction: transaction });
    if (!response) {
      throw new AppError('Not able to fund the resource', 404);
    }
    return response;
  }

  async update(id, data, transaction) {
    const response = await this.model.update(
      data,
      {
        where: {
          id: id,
        },
      },
      { transaction: transaction },
    );
    return response;
  }
}
