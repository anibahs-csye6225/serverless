
const winston = require('winston');
const { combine, timestamp, json, errors } = winston.format;

const dotenv = require('dotenv');
dotenv.config({ path: '.env' });


console.log("process.env.LOGPATH", process.env.LOGPATH)

const logger = winston.createLogger({
  level: 'debug',
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports: [
    new winston.transports.File({ filename: process.env.LOGPATH? process.env.LOGPATH:'./webapp.log'})

 ]
});

logger.info("Start logging")
module.exports = logger;


