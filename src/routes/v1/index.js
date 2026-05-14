import express, { Router } from 'express';
import server from './server.route.js';

const router = Router();

router.use('/server', server);

export default router;
