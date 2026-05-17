import dotenv from 'dotenv';

dotenv.config();

export default {
  PORT: process.env.PORT || 3000,
  FLIGHT_SERVICE: process.env.FLIGHT_SERVICE,
};
