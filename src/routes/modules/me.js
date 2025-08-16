const express = require('express');
const router = express.Router();
const HttpError = require('@/errors/HttpError');
const verifyToken = require('@/middlewares/verifyToken');
const User = require('@/models/user');

router.get('/', verifyToken, async (req, res, next) => {
    try {
        const user = await User.findOne({ code: req.userCode });
        if (!user) {
            throw new HttpError(req.t('error.resourceNotFound'), 404);
        }

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

router.put('/', verifyToken, async (req, res, next) => {
    try {
        const user = await User.findOne({ code: req.userCode });
        if (!user) {
            throw new HttpError(req.t('error.resourceNotFound'), 404);
        }

        user.name = req.body.name ?? user.name;
        user.updatedAt = new Date();
        user.updatedBy = req.userName;
        user.updatedById = req.userId;
        await user.save();

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

module.exports = router;