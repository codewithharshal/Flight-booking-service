import express from 'express';
import serverConfig from './config/serverConfig.js';
import v1Route from './routes/index.js';

const app = express();

app.use('/api', v1Route);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(serverConfig.PORT, () => {
  console.log('Server running');
});
