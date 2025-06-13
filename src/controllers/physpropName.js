const express = require('express');
const router = express.Router();
const HttpError = require('@/errors/HttpError');
const PhyspropName = require('@/models/physpropName');

router.get('/', async (req, res, next) => {
    try {
        const physpropNames = await PhyspropName.find();
        res.status(200).json(physpropNames);
    } catch (err) {
        next(err);
    }
});

router.get('/:code', async (req, res, next) => {
    const{ code } = req.params;

    try {
        const physpropName = await PhyspropName.findOne({ code });
        if (!physpropName) {
            throw new HttpError('物性コードが存在しません。', 404);
        }

        res.status(200).json(physpropName);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    const {
        code,
        name,
        uom,
        numberSize,
        localizes,
        remarks,
        isActive,
    } = req.body;

    try {
        const exists = await PhyspropName.findOne({ code });
        if (exists) {
            throw new HttpError('物性コードが既に存在します。', 409);
        }

        const physpropName = new PhyspropName();
        physpropName.code = code;
        physpropName.name = name;
        physpropName.uom = uom;
        physpropName.numberSize = numberSize;
        physpropName.localizes = localizes;
        physpropName.remarks = remarks;
        physpropName.isActive = isActive;
        physpropName.createdAt = new Date();
        physpropName.createdBy = req.userName;
        physpropName.createdById = req.userId;
        physpropName.updatedAt = new Date();
        physpropName.updatedBy = req.userName;
        physpropName.updatedById = req.userId;
        await physpropName.save();

        res.status(201).json(physpropName);
    } catch (err) {
        next(err);
    }
});

router.put('/:code', async (req, res, next) => {
    const { code } = req.params;

    const {
        name,
        uom,
        numberSize,
        localizes,
        remarks,
        isActive,
    } = req.body;

    try {
        const physpropName = await PhyspropName.findOne({ code })
        if (!physpropName) {
            throw new HttpError('物性コードが存在しません。', 404);
        }

        physpropName.name = name;
        physpropName.uom = uom;
        physpropName.numberSize = numberSize;
        physpropName.localizes = localizes;
        physpropName.remarks = remarks;
        physpropName.isActive = isActive;
        physpropName.updatedAt = new Date();
        physpropName.updatedBy = req.userName;
        physpropName.updatedById = req.userId;
        await physpropName.save();

        res.status(200).json(physpropName);
    } catch (err) {
        next(err);
    }
});

router.delete('/:code', async (req, res, next) => {
    const { code } = req.params;

    try {
        const physpropName = await PhyspropName.findOne({ code });
        if (!physpropName) {
            throw new HttpError('物性コードが存在しません。', 404);
        }

        physpropName.isActive = false;
        physpropName.updatedAt = new Date();
        physpropName.updatedBy = req.userName;
        physpropName.updatedById = req.userId;
        await physpropName.save();

        res.status(200).json(physpropName);
    } catch (err) {
        next(err);
    }
});

module.exports = router;