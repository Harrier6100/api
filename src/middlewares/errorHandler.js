const errorHandler = (err, req, res, next) => {
    if (!res.headersSend) {
        const status = err.status;
        res.status(status).json({
            status: status,
            message: err.message,
            error: err,
        });
    }
};

module.exports = errorHandler;