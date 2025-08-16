const errorHandler = (err, req, res, next) => {
    if (!res.headersSent) {
        const statusCode = err.status || 500;
        res.status(statusCode).json({
            status: statusCode,
            message: err.message,
            error: err,
        });
    }
};

module.exports = errorHandler;