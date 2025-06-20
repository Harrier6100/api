const express = require('express');
const router = express.Router();
const HttpError = require('@/errors/HttpError');
const db = require('@/config/db.postgres');
const snakecase = require('@/utils/snakecase');

router.get('/search', async (req, res, next) => {
    let { field, sort } = req.query;
    field = field ? snakecase(field) : '*';
    sort = sort ? snakecase(sort) : 'code, lot';

    let filter = '1=1';

    if (req.query.lot) {
        filter += ' AND lot ILIKE ANY (to_array(${lot}))';
    }

    if (req.query.code) {
        filter += ' AND code ILIKE ANY (to_array(${code}))';
    }

    if (req.query.name) {
        filter += ' AND name ILIKE ANY (to_array(${name}))';
    }

    if (req.query.isIncludeOutOfStock !== 'true') {
        filter += ' AND stock_qty > 0';
    }

    try {
        const stocks = await db.any(`
            SELECT ${field} FROM stocks
                WHERE ${filter} ORDER BY ${sort}
        `, req.query);

        res.status(200).json(stocks);
    } catch (err) {
        next(err);
    }
});

router.get('/:lot', async (req, res, next) => {
    const { lot } = req.params;

    try {
        const stock = await db.oneOrNone(`
            SELECT * FROM stocks
                WHERE lot = \${lot}
        `, { lot });

        if (!stock) {
            throw new HttpError('レコードが存在しません。', 404);
        }

        res.status(200).json(stock);
    } catch (err) {
        next(err);
    }
});

module.exports = router;