const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const HttpError = require('@/errors/HttpError');
const verifyToken = require('@/middlewares/verifyToken');
const User = require('@/models/user');

router.get('/', verifyToken, async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
});

router.get('/:code', verifyToken, async (req, res, next) => {
    try {
        const { code } = req.params;

        const user = await User.findOne({ code });
        if (!user) {
            throw new HttpError(req.t('error.resourceNotFound'), 404);
        }

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

router.post('/', verifyToken, async (req, res, next) => {
    try {
        const {
            code,
            name,
            role,
            permissions,
            expiryDate,
            remarks,
            isActive,
        } = req.body;

        const exists = await User.findOne({ code });
        if (exists) {
            throw new HttpError(req.t('error.resourceAlreadyExists'), 409);
        }

        const user = new User();
        user.code = code;
        user.name = name;
        user.password = await bcrypt.hash(code, 10);
        user.role = role;
        user.permissions = permissions;
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
    try {
        const { code } = req.params;

        const {
            name,
            role,
            permissions,
            expiryDate,
            remarks,
            isActive,
        } = req.body;

        const user = await User.findOne({ code });
        if (!user) {
            throw new HttpError(req.t('error.resourceNotFound'), 404);
        }

        user.name = name ?? user.name;
        user.role = role ?? user.role;
        user.permissions = permissions ?? user.permissions;
        user.expiryDate = expiryDate ?? user.expiryDate;
        user.remarks = remarks ?? user.remarks;
        user.isActive = isActive ?? user.isActive;
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
    try {
        const { code } = req.params;

        // const user = await User.findOne({ code });
        // if (!user) {
        //     throw new HttpError(req.t('error.resourceNotFound'), 404);
        // }

        // user.isActive = false;
        // user.updatedAt = new Date();
        // user.updatedBy = req.userName;
        // user.updatedById = req.userId;
        // await user.save();

        const user = await User.findOneAndDelete({ code });
        if (!user) {
            throw new HttpError(req.t('error.resourceNotFound'), 404);
        }

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

module.exports = router;