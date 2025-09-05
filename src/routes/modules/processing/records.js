const express = require('express');
const router = express.Router();
const HttpError = require('@/errors/HttpError');
const db = require('@/config/db.postgres');
const snakecase = require('@/utils/snakecase');

router.get('/', async (req, res, next) => {
    try {
        let { field, sort } = req.query;
        field = field ? snakecase(field) : '*';
        sort = sort ? snakecase(sort) : 'batch_id, batch_line_id';

        let filter = '1=1';
        if (req.query.batchPlanId) {
            filter += ' AND batch_plan_id = ${batchPlanId}';
        }

        const processingRecords = await db.any(`
            SELECT ${field} FROM processing_records
                WHERE ${filter} ORDER BY ${sort}
        `, req.query);

        res.status(200).json(processingRecords);
    } catch (err) {
        next(err);
    }
});

module.exports = router;