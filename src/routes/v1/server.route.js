import express, { Router } from 'express';
import serverController from '../../controllers/server.controller.js';

const server = Router();

server.get('/info', serverController.info);

export default server;
