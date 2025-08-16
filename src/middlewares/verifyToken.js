const jsonwebtoken = require('jsonwebtoken');
const HttpError = require('@/errors/HttpError');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return next(new HttpError(req.t('error.auth.tokenMissing'), 401));
    }

    jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return next(new HttpError(req.t('error.auth.tokenInvalid'), 401));
        }
        
        req.userId = decoded.id;
        req.userCode = decoded.code;
        req.userName = decoded.name;

        next();
    });
};

module.exports = verifyToken;