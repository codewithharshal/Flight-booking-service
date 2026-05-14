import express, { Router } from 'express';
import router from './v1/index.js';

const v1Route = Router();

v1Route.use('/v1', router);

export default v1Route;
