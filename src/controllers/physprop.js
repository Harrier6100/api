const express = require('express');
const router = express.Router();
const HttpError = require('@/errors/HttpError');
const Physprop = require('@/models/physprop');
const verifyToken = require('@/middlewares/verifyToken');


router.get('/', verifyToken, async (req, res, next) => {
    try {
        const Physprops = await Physprop.find();
        res.status(200).json(Physprops);
    } catch (err) {
        next(err);
    }
});

router.get('/:code', verifyToken, async (req, res, next) => {
    const{ code } = req.params;

    try {
        const physprop = await Physprop.findOne({ code });
        if (!physprop) {
            throw new HttpError('物性コードが存在しません。', 404);
        }

        res.status(200).json(physprop);
    } catch (err) {
        next(err);
    }
});

router.post('/', verifyToken, async (req, res, next) => {
    const {
        code,
        name,
        uom,
        si_uom,
        numberSize,
        localizes,
        remarks,
        isActive,
    } = req.body;

    try {
        const exists = await Physprop.findOne({ code });
        if (exists) {
            throw new HttpError('物性コードが既に存在します。', 409);
        }

        const physprop = new Physprop();
        physprop.code = code;
        physprop.name = name;
        physprop.uom = uom;
        physprop.si_uom = si_uom;
        physprop.numberSize = numberSize;
        physprop.localizes = localizes;
        physprop.remarks = remarks;
        physprop.isActive = isActive;
        physprop.createdAt = new Date();
        physprop.createdBy = req.userName;
        physprop.createdById = req.userId;
        physprop.updatedAt = new Date();
        physprop.updatedBy = req.userName;
        physprop.updatedById = req.userId;
        await physprop.save();

        res.status(201).json(physprop);
    } catch (err) {
        next(err);
    }
});

router.put('/:code', verifyToken, async (req, res, next) => {
    const { code } = req.params;

    const {
        name,
        uom,
        si_uom,
        numberSize,
        localizes,
        remarks,
        isActive,
    } = req.body;

    try {
        const physprop = await Physprop.findOne({ code })
        if (!physprop) {
            throw new HttpError('物性コードが存在しません。', 404);
        }

        physprop.name = name;
        physprop.uom = uom;
        physprop.si_uom = si_uom;
        physprop.numberSize = numberSize;
        physprop.localizes = localizes;
        physprop.remarks = remarks;
        physprop.isActive = isActive;
        physprop.updatedAt = new Date();
        physprop.updatedBy = req.userName;
        physprop.updatedById = req.userId;
        await physprop.save();

        res.status(200).json(physprop);
    } catch (err) {
        next(err);
    }
});

router.delete('/:code', verifyToken, async (req, res, next) => {
    const { code } = req.params;

    try {
        const physprop = await Physprop.findOne({ code });
        if (!physprop) {
            throw new HttpError('物性コードが存在しません。', 404);
        }

        physprop.isActive = false;
        physprop.updatedAt = new Date();
        physprop.updatedBy = req.userName;
        physprop.updatedById = req.userId;
        await physprop.save();

        res.status(200).json(physprop);
    } catch (err) {
        next(err);
    }
});

module.exports = router;