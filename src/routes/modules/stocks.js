const express = require('express');
const router = express.Router();
const db = require('@/config/db.postgres');
const HttpError = require('@/errors/HttpError');
const snakecase = require('@/utils/snakecase');

router.get(['/', '/search'], async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'code, lot';

        const filters = ['1=1'];
        if (req.query.code) {
            filters.push('code ILIKE ANY (to_array(${code}))');
        }
        if (req.query.name) {
            filters.push('name ILIKE ANY (to_array(${name}))');
        }
        if (req.query.lot) {
            filters.push('lot ILIKE ANY (to_array(${lot}))');
        }
        if (req.query.isIncludeOutOfStock !== 'true') {
            filters.push('stock_qty > 0');
        }
        const filter = filters.join(' AND ');

        const stocks = await db.any(`
            SELECT ${field} FROM stocks WHERE ${filter} ORDER BY ${sort}
        `, req.query);

        res.status(200).json(stocks);
    } catch (err) {
        next(err);
    }
});

router.get('/:lot', async (req, res, next) => {
    try {
        const { lot } = req.params;

        const stock = await db.oneOrNone(`
            SELECT * FROM stocks WHERE lot = \${lot}`
        , { lot });

        if (!stock) {
            throw new HttpError(req.t('error.resourceNotFound'), 404);
        }

        res.status(200).json(stock);
    } catch (err) {
        next(err);
    }
});

module.exports = router;