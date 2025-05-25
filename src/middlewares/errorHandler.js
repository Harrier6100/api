const errorHandler = (err, req, res, next) => {
    if (!res.headersSent) {
        const status = err.status || 500;
        res.status(status).json({
            status: status,
            message: err.message,
            error: err,
        });
    }
};

module.exports = errorHandler;