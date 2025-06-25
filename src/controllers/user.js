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

router.get('/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;

    try {
        const user = await User.findOne({ id });
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
        id,
        name,
        role,
        expiryDate,
        remarks,
        isActive,
    } = req.body;

    try {
        const exists = await User.findOne({ id });
        if (exists) {
            throw new HttpError('アカウントが既に存在します。', 409);
        }

        const user = new User();
        user.id = id;
        user.name = name;
        user.password = await bcrypt.hash(id, 10);
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

router.put('/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;

    const {
        name,
        role,
        expiryDate,
        remarks,
        isActive,
    } = req.body;

    try {
        const user = await User.findOne({ id })
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

router.delete('/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;

    try {
        // const user = await User.findOne({ id });
        // if (!user) {
        //     throw new HttpError('アカウントが存在しません。', 404);
        // }

        // user.isActive = false;
        // user.updatedAt = new Date();
        // user.updatedBy = req.userName;
        // user.updatedById = req.userId;
        // await user.save();

        // res.status(200).json(user);

        const user = await User.findOneAndDelete({ id });
        if (!user) {
            throw new HttpError('アカウントが存在しません。', 404);
        }
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

module.exports = router;