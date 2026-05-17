import createCustomLogger from '../config/loggerConfig.js';

const logger = createCustomLogger('contoller');

const info = (req, res) => {
  logger.info('Server check');
  return res.status(200).json({
    message: 'Server service is live',
  });
};

export default {
  info,
};
