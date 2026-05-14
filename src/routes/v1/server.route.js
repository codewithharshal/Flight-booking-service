import express, { Router } from 'express';
import serverContoller from '../../controllers/server.contoller.js';

const server = Router();

server.get('/info', serverContoller.info);

export default server;
