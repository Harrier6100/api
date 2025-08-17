const express = require('express');
const router = express.Router();
const moment = require('moment');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const HttpError = require('@/errors/HttpError');
const User = require('@/models/user');

const generateAccessToken = ({ id, code, name }) => {
    return jsonwebtoken.sign(
        { id, code, name },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
    );
};

const generateRefreshToken = ({ id, code, name }) => {
    return jsonwebtoken.sign(
        { id, code, name },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
};

router.post('/login', async (req, res, next) => {
    try {
        const { code, password } = req.body;

        const user = await User.findOne({ code });
        console.log(user);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new HttpError(req.t('error.auth.failed'), 401);
        }

        const expiryDate = moment(user.expiryDate).endOf('day');
        if (user.role === 'guest' && expiryDate.isBefore(moment())) {
            throw new HttpError(req.t('error.auth.expired'), 401);
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        res.status(200).json({ token: accessToken });
    } catch (err) {
        next(err);
    }
});

router.post('/refresh', async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            throw new HttpError(req.t('error.auth.refreshTokenMissing'), 401);
        }

        const decoded = await new Promise((resolve, reject) => {
            jsonwebtoken.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return reject(new HttpError(req.t('error.auth.refreshTokenInvalid'), 401));
                }

                resolve(decoded);
            });
        });

        const user = await User.findOne({ code: decoded.code });
        if (!user) {
            throw new HttpError(req.t('error.resourceNotFound'), 401);
        }

        const expiryDate = moment(user.expiryDate).endOf('day');
        if (user.role === 'guest' && expiryDate.isBefore(moment())) {
            throw new HttpError(req.t('error.auth.expired'), 401);
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        res.status(200).json({ token: accessToken });
    } catch (err) {
        next(err);
    }
});

router.post('/logout', (req, res, next) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(204);

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'Strict',
    });

    res.sendStatus(204);
});

module.exports = router;