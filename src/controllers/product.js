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
        const products = await db.any(`
            SELECT ${field} FROM products
                WHERE ${filter} ORDER BY ${sort}
        `, req.query);

        res.status(200).json(products);
    } catch (err) {
        next(err);
    }
});

router.get('/:productCode', async (req, res, next) => {
    const { productCode } = req.params;

    try {
        const product = await db.oneOrNone(`
            SELECT * FROM products
                WHERE product_code = \${productCode}
        `, { productCode });

        if (!product) {
            throw new HttpError('レコードが存在しません。', 404);
        }

        res.status(200).json(product);
    } catch (err) {
        next(err);
    }
});

module.exports = router;