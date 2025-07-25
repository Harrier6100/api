const express = require('express');
const router = express.Router();
const HttpError = require('@/errors/HttpError');
const PhyspropSpec = require('@/models/physpropSpec');
const verifyToken = require('@/middlewares/verifyToken');

router.get('/', verifyToken, async (req, res, next) => {
    try {
        const physpropSpecs = await PhyspropSpec.find();
        res.status(200).json(physpropSpecs);
    } catch (err) {
        next(err);
    }
});

router.get('/:productCode{/:customerCode}', verifyToken, async (req, res, next) => {
    const{
        productCode,
        customerCode,
    } = req.params;

    try {
        const filter = { productCode };
        if (customerCode) {
            filter.customerCode = customerCode;
        }
        const physpropSpec = await PhyspropSpec.findOne(filter);
        if (!physpropSpec) {
            throw new HttpError('物性規格が存在しません。', 404);
        }

        res.status(200).json(physpropSpec);
    } catch (err) {
        next(err);
    }
});

router.post('/', verifyToken, async (req, res, next) => {
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
        const filter = { productCode };
        if (customerCode) {
            filter.customerCode = customerCode;
        }
        const exists = await PhyspropSpec.findOne(filter);
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

router.put('/:productCode{/:customerCode}', verifyToken, async (req, res, next) => {
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
        const filter = { productCode };
        if (customerCode) {
            filter.customerCode = customerCode;
        }
        const physpropSpec = await PhyspropSpec.findOne(filter);
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

router.delete('/:productCode{/:customerCode}', verifyToken, async (req, res, next) => {
    const {
        productCode,
        customerCode,
    } = req.params;

    try {
        const filter = { productCode };
        if (customerCode) {
            filter.customerCode = customerCode;
        }
        const physpropSpec = await PhyspropSpec.findOne(filter);
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