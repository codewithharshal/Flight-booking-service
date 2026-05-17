import CrudRepository from './crud.repository.js';
import db from '../models/index.js';

export default class BookingRepository extends CrudRepository {
  constructor() {
    super(db.Booking);
  }
}
