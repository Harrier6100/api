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
        if (req.query.machineCode) {
            filter += ' AND machine_code = ${machineCode}';
        }

        if (req.query.formulationDateFrom) {
            filter += ' AND formulation_date >= ${formulationDateFrom}';
        }

        if (req.query.formulationDateTo) {
            filter += ' AND formulation_date <= ${formulationDateTo}';
        }

        if (req.query.adhesiveLot) {
            filter += ' AND adhesive_lot = ${adhesiveLot}';
        }

        const adhesiveRecords = await db.any(`
            SELECT ${field} FROM adhesive_records
                WHERE ${filter} ORDER BY ${sort}
        `, req.query);

        res.status(200).json(adhesiveRecords);
    } catch (err) {
        next(err);
    }
});

module.exports = router;