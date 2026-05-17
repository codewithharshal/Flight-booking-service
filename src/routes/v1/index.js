import express, { Router } from 'express';
import server from './server.route.js';
import Bookingrouter from './booking.route.js';

const router = Router();

router.use('/server', server);
router.use('/bookings', Bookingrouter);

export default router;
