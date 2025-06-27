const express = require('express');
const router = express.Router();
const HttpError = require('@/errors/HttpError');
const db = require('@/config/db.postgres');
const snakecase = require('@/utils/snakecase');

router.get('/search', async (req, res, next) => {
    let { field, sort } = req.query;
    field = field ? snakecase(field) : '*';
    sort = sort ? snakecase(sort) : 'customer_code';

    let filter = '1=1';

    if (req.query.customerCode) {
        filter += ' AND customer_code ILIKE ANY (to_array(${customerCode}))';
    }

    if (req.query.customerName) {
        filter += ' AND customer_name ILIKE ANY (to_array(${customerName}))';
    }

    try {
        const customers = await db.any(`
            SELECT ${field} FROM customers
                WHERE ${filter} ORDER BY ${sort}
        `, req.query);

        res.status(200).json(customers);
    } catch (err) {
        next(err);
    }
});

router.get('/:customerCode', async (req, res, next) => {
    const { customerCode } = req.params;

    try {
        const customer = await db.oneOrNone(`
            SELECT * FROM customers
                WHERE customer_code = \${customerCode}
        `, { customer });

        if (!customer) {
            throw new HttpError('レコードが存在しません。', 404);
        }

        res.status(200).json(customer);
    } catch (err) {
        next(err);
    }
});

module.exports = router;