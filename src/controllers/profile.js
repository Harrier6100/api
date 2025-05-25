const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const HttpError = require('@/errors/HttpError');
const verifyToken = require('@/middlewares/verifyToken');
const User = require('@/models/user');

router.get('/profile', verifyToken, async (req, res, next) => {
    try {
        const user = await User.findOne({ id: req.userId });
        if (!user) throw new HttpError('アカウントが存在しません。', 404);
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

router.put('/profile', verifyToken, async (req, res, next) => {
    const {
        name,
    } = req.body;

    try {
        const user = await User.findOne({ id: req.userId });
        if (!user) throw new HttpError('アカウントが存在しません。', 404);

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

router.put('/profile/password', verifyToken, async (req, res, next) => {
    const { password } = req.body;

    try {
        const user = await User.findOne({ id: req.userId });
        if (!user) throw new HttpError('アカウントが存在しません。', 404);

        user.password = await bcrypt.hash(password, 10);
        await user.save();
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

module.exports = router;