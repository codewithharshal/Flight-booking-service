import express from 'express';
import serverConfig from './config/serverConfig.js';
import v1Route from './routes/index.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', v1Route);

app.listen(serverConfig.PORT, () => {
  console.log('Server running');
});
