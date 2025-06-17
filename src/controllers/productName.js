const express = require('express');
const router = express.Router();
const HttpError = require('@/errors/HttpError');
const db = require('@/config/db.postgres');
const snakecase = require('@/utils/snakecase');

router.get('/search', async (req, res, next) => {
    let { field, sort } = req.query;
    field = field ? snakecase(field) : '*';
    sort = sort ? snakecase(sort) : 'product_code';

    let filter = '1=1';

    if (req.query.productCode) {
        filter += ' AND product_code ILIKE ANY (to_array(${productCode}))';
    }

    if (req.query.productName) {
        filter += ' AND product_name ILIKE ANY (to_array(${productName}))';
    }

    try {
        const productNames = await db.any(`
            SELECT ${field} FROM product_names
                WHERE ${filter} ORDER BY ${sort}
        `, req.query);

        res.status(200).json(productNames);
    } catch (err) {
        next(err);
    }
});

router.get('/:productCode', async (req, res, next) => {
    const { productCode } = req.params;

    try {
        const productName = await db.oneOrNone(`
            SELECT * FROM product_names
                WHERE product_code = \${productCode}
        `, { productCode });

        if (!productName) {
            throw new HttpError('レコードが存在しません。', 404);
        }

        res.status(200).json(productName);
    } catch (err) {
        next(err);
    }
});

module.exports = router;