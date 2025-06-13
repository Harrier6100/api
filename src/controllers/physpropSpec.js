const express = require('express');
const router = express.Router();
const HttpError = require('@/errors/HttpError');
const PhyspropSpec = require('@/models/physpropSpec');

router.get('/', async (req, res, next) => {
    try {
        const physpropSpecs = await PhyspropSpec.find();
        res.status(200).json(physpropSpecs);
    } catch (err) {
        next(err);
    }
});

router.get('/:productCode{/:customerCode}', async (req, res, next) => {
    const{
        productCode,
        customerCode,
    } = req.params;

    try {
        const physpropSpec = await PhyspropSpec.findOne({ productCode, customerCode });
        if (!physpropSpec) {
            throw new HttpError('物性規格が存在しません。', 404);
        }

        res.status(200).json(physpropSpec);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    const {
        productCode,
        productName,
        customerCode,
        customerName,
        specs,
        remarks,
        isActive,
    } = req.body;

    try {
        const exists = await PhyspropSpec.findOne({ productCode, customerCode });
        if (exists) {
            throw new HttpError('物性規格が既に存在します。', 409);
        }

        const physpropSpec = new PhyspropSpec();
        physpropSpec.productCode = productCode;
        physpropSpec.productName = productName;
        physpropSpec.customerCode = customerCode;
        physpropSpec.customerName = customerName;
        physpropSpec.specs = specs;
        physpropSpec.remarks = remarks;
        physpropSpec.isActive = isActive;
        physpropSpec.createdAt = new Date();
        physpropSpec.createdBy = req.userName;
        physpropSpec.createdById = req.userId;
        physpropSpec.updatedAt = new Date();
        physpropSpec.updatedBy = req.userName;
        physpropSpec.updatedById = req.userId;
        await physpropSpec.save();

        res.status(201).json(physpropSpec);
    } catch (err) {
        next(err);
    }
});

router.put('/:productCode{/:customerCode}', async (req, res, next) => {
    const {
        productCode,
        customerCode,
    } = req.params;

    const {
        productName,
        customerName,
        specs,
        remarks,
        isActive,
    } = req.body;

    try {
        const physpropSpec = await PhyspropSpec.findOne({ productCode, customerCode })
        if (!physpropSpec) {
            throw new HttpError('物性規格が存在しません。', 404);
        }

        physpropSpec.productName = productName;
        physpropSpec.customerName = customerName;
        physpropSpec.specs = specs;
        physpropSpec.remarks = remarks;
        physpropSpec.isActive = isActive;
        physpropSpec.updatedAt = new Date();
        physpropSpec.updatedBy = req.userName;
        physpropSpec.updatedById = req.userId;
        await physpropSpec.save();

        res.status(200).json(physpropSpec);
    } catch (err) {
        next(err);
    }
});

router.delete('/:productCode{/:customerCode}', async (req, res, next) => {
    const {
        productCode,
        customerCode,
    } = req.params;

    try {
        const physpropSpec = await PhyspropSpec.findOne({ productCode, customerCode });
        if (!physpropSpec) {
            throw new HttpError('物性規格が存在しません。', 404);
        }

        physpropSpec.isActive = false;
        physpropSpec.updatedAt = new Date();
        physpropSpec.updatedBy = req.userName;
        physpropSpec.updatedById = req.userId;
        await physpropSpec.save();

        res.status(200).json(physpropSpec);
    } catch (err) {
        next(err);
    }
});

module.exports = router;