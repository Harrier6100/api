const express = require('express');
const router = express.Router();
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
const HttpError = require('@/errors/HttpError');
const User = require('@/models/user');

router.post('/signin', async (req, res, next) => {
    const { id, password } = req.body;

    try {
        const user = await User.findOne({ id });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new HttpError('アカウントまたはパスワードが不正です。', 401);
        }
        if (user.role === 'guest' && !checkExpiryDate(user.expiryDate)) {
            throw new HttpError('アカウントの有効期限が切れています。', 401);
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

router.post('/signin/auto', async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) throw new HttpError('リフレッシュトークンがありません。', 401);

        const decoded = await new Promise((resolve, reject) => {
            jsonwebtoken.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return reject(new HttpError('リフレッシュトークンが無効です。', 401));
                }
                resolve(decoded);
            });
        });

        const user = await User.findOne({ id: decoded.id });
        if (!user) {
            throw new HttpError('アカウントが存在しません。', 401);
        }
        if (user.role === 'guest' && !checkExpiryDate(user.expiryDate)) {
            throw new HttpError('アカウントの有効期限が切れています。', 401);
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

router.post('/signout', async (req, res, next) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        return res.sendStatus(204);
    }

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'Strict',
    });

    res.sendStatus(204);
});

const generateAccessToken = ({ id, name }) => {
    return jsonwebtoken.sign({ id, name }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = ({ id, name }) => {
    return jsonwebtoken.sign({ id, name }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

module.exports = router;