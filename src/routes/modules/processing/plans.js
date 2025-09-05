const express = require('express');
const router = express.Router();
const HttpError = require('@/errors/HttpError');
const db = require('@/config/db.postgres');
const snakecase = require('@/utils/snakecase');

router.get('/', async (req, res, next) => {
    try {
        let { field, sort } = req.query;
        field = field ? snakecase(field) : '*';
        sort = sort ? snakecase(sort) : 'machine_code, period, week, sequence_number';

        let filter = '1=1';
        if (req.query.machineCode) {
            filter += ' AND machine_code = ${machineCode}';
        }

        if (req.query.period) {
            filter += ' AND period = ${period}';
        }

        if (req.query.week) {
            filter += ' AND week = ${week}';
        }

        const processingPlans = await db.any(`
            SELECT ${field} FROM processing_plans
                WHERE ${filter} ORDER BY ${sort}
        `, req.query);

        res.status(200).json(processingPlans);
    } catch (err) {
        next(err);
    }
});

module.exports = router;