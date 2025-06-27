const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const HttpError = require('@/errors/HttpError');
const User = require('@/models/user');
const verifyToken = require('@/middlewares/verifyToken');

router.get('/', verifyToken, async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
});

router.get('/:code', verifyToken, async (req, res, next) => {
    const { code } = req.params;

    try {
        const user = await User.findOne({ code });
        if (!user) {
            throw new HttpError('アカウントが存在しません。', 404);
        }

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

router.post('/', verifyToken, async (req, res, next) => {
    const {
        code,
        name,
        role,
        expiryDate,
        remarks,
        isActive,
    } = req.body;

    try {
        const exists = await User.findOne({ code });
        if (exists) {
            throw new HttpError('アカウントが既に存在します。', 409);
        }

        const user = new User();
        user.code = code;
        user.name = name;
        user.password = await bcrypt.hash(code, 10);
        user.role = role;
        user.expiryDate = expiryDate;
        user.remarks = remarks;
        user.isActive = isActive;
        user.createdAt = new Date();
        user.createdBy = req.userName;
        user.createdById = req.userId;
        user.updatedAt = new Date();
        user.updatedBy = req.userName;
        user.updatedById = req.userId;
        await user.save();

        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
});

router.put('/:code', verifyToken, async (req, res, next) => {
    const { code } = req.params;

    const {
        name,
        role,
        expiryDate,
        remarks,
        isActive,
    } = req.body;

    try {
        const user = await User.findOne({ code })
        if (!user) {
            throw new HttpError('アカウントが存在しません。', 404);
        }

        user.name = name;
        user.role = role;
        user.expiryDate = expiryDate;
        user.remarks = remarks;
        user.isActive = isActive;
        user.updatedAt = new Date();
        user.updatedBy = req.userName;
        user.updatedById = req.userId;
        await user.save();

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

router.delete('/:code', verifyToken, async (req, res, next) => {
    const { code } = req.params;

    try {
        // const user = await User.findOne({ code });
        // if (!user) {
        //     throw new HttpError('アカウントが存在しません。', 404);
        // }

        // user.isActive = false;
        // user.updatedAt = new Date();
        // user.updatedBy = req.userName;
        // user.updatedById = req.userId;
        // await user.save();

        // res.status(200).json(user);

        const user = await User.findOneAndDelete({ code });
        if (!user) {
            throw new HttpError('アカウントが存在しません。', 404);
        }
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

module.exports = router;