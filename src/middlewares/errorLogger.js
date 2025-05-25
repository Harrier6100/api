const log4js = require('log4js');
log4js.configure('./src/config/log4js.json');
const logger = log4js.getLogger('error');

const errorLogger = (err, req, res, next) => {
    const status = err.status || res.statusCode || 500;
    if (status === 500) {
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
        const method = req.method;
        const request = req.originalUrl;

        logger.error(`[${ip}] ${method} ${status} ${request}\n${err.stack || err.toString()}`);
    }
    next(err);
};

module.exports = errorLogger;