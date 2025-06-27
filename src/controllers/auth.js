const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const moment = require('moment');
const HttpError = require('@/errors/HttpError');
const verifyToken = require('@/middlewares/verifyToken');
const User = require('@/models/user');

const verifyExpiryDate = (date) => {
    const expiryDate = moment(date).endOf('day');
    return expiryDate.isBefore(moment());
};

const generateAccessToken = ({ id, code, name }) => {
    return jsonwebtoken.sign({ id, code, name }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = ({ id, code, name }) => {
    return jsonwebtoken.sign({ id, code, name }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

router.get('/me', verifyToken, async (req, res, next) => {
    try {
        const user = await User.findOne({ code: req.userCode });
        if (!user) {
            throw new HttpError('アカウントが存在しません。', 404);
        }

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

router.put('/me/name', verifyToken, async (req, res, next) => {
    const { name } = req.body;

    try {
        const user = await User.findOne({ code: req.userCode });
        if (!user) {
            throw new HttpError('アカウントが存在しません。', 404);
        }

        user.name = name;
        user.updatedAt = new Date();
        user.updatedBy = req.userName;
        user.updatedById = req.userId;
        await user.save();

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

router.put('/me/email', verifyToken, async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ code: req.userCode });
        if (!user) {
            throw new HttpError('アカウントが存在しません。', 404);
        }

        user.email = email;
        user.updatedAt = new Date();
        user.updatedBy = req.userName;
        user.updatedById = req.userId;
        await user.save();

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

router.put('/me/password', verifyToken, async (req, res, next) => {
    const { password } = req.body;

    try {
        const user = await User.findOne({ code: req.userCode });
        if (!user) {
            throw new HttpError('アカウントが存在しません。', 404);
        }

        user.password = await bcrypt.hash(password, 10);
        await user.save();

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

router.post('/login', async (req, res, next) => {
    const { code, password } = req.body;

    try {
        const user = await User.findOne({ code });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new HttpError('アカウントまたはパスワードが不正です。', 401);
        }
        if (user.role === 'guest' && verifyExpiryDate(user.expiryDate)) {
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

router.post('/refresh', async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            throw new HttpError('リフレッシュトークンがありません。', 401);
        }

        const decoded = await new Promise((resolve, reject) => {
            jsonwebtoken.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return reject(new HttpError('リフレッシュトークンが無効です。', 401));
                }
                resolve(decoded);
            });
        });

        const user = await User.findOne({ code: decoded.code });
        if (!user) {
            throw new HttpError('アカウントが存在しません。', 401);
        }
        if (user.role === 'guest' && verifyExpiryDate(user.expiryDate)) {
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

router.post('/logout', async (req, res, next) => {
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