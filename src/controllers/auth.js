const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const HttpError = require('@/errors/HttpError');
const User = require('@/models/user');

router.post('/signin', async (req, res, next) => {
    const { id, password } = req.body;

    try {
        const user = await User.findOne({ id });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new HttpError('アカウントまたはパスワードが不正です。', 401);
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

const generateAccessToken = ({ id, name }) => {
    return jsonwebtoken.sign({ id, name }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = ({ id, name }) => {
    return jsonwebtoken.sign({ id, name }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

module.exports = router;