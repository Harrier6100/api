const jsonwebtoken = require('jsonwebtoken');
const HttpError = require('@/errors/HttpError');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return next(new HttpError('トークンがありません。', 401));
    }

    jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return next(new HttpError('トークンが無効です。', 401));
        }
        req.userId = decoded.id;
        req.userName = decoded.name;
        next();
    });
};

module.exports = verifyToken;