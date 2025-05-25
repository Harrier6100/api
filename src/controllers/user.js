const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const HttpError = require('@/errors/HttpError');
const User = require('@/models/user');
const verifyToken = require('@/middlewares/verifyToken');

router.get('/', verifyToken, async (req, res, next) => {
    try {
        // const users = await User.find({ isRemoved: { $ne: true }});
        const users = await User.find();
        
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
});

router.get('/:id', verifyToken, async (req, res, next) => {
    try {
        const user = await User.findOne({ id: req.params.id });
        if (!user) throw new HttpError('アカウントが存在しません。', 404);

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

router.post('/', verifyToken, async (req, res, next) => {
    const {
        id,
        name,
        email,
        role,
        expiryDate,
        remarks,
        isRemoved,
    } = req.body;

    try {
        const exists = await User.findOne({ id });
        if (exists) throw new HttpError('既にアカウントが存在します。', 409);

        const user = new User();
        user.id = id;
        user.name = name;
        user.email = email;
        user.password = await bcrypt.hash(id, 10);
        user.role = role;
        user.expiryDate = expiryDate;
        user.remarks = remarks;
        user.isRemoved = isRemoved;
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
    const {
        name,
        email,
        role,
        expiryDate,
        remarks,
        isRemoved,
    } = req.body;

    try {
        const user = await User.findOne({ id: req.params.id });
        if (!user) throw new HttpError('アカウントが存在しません。', 404);

        user.name = name;
        user.email = email;
        user.role = role;
        user.expiryDate = expiryDate;
        user.remarks = remarks;
        user.isRemoved = isRemoved;
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
    try {
        const user = await User.findOneAndDelete({ id: req.params.id });
        // const user = await User.findOne({ id: req.params.id });
        if (!user) throw new HttpError('アカウントが存在しません。', 404);

        // user.isRemoved = true;
        // user.updatedAt = new Date();
        // user.updatedBy = req.userName;
        // user.updatedById = req.userId;
        // await user.save();

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

module.exports = router;