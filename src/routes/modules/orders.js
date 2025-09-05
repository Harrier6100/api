const express = require('express');
const router = express.Router();
const HttpError = require('@/errors/HttpError');
const db = require('@/config/db.postgres');
const snakecase = require('@/utils/snakecase');

router.get('/cf/search', async (req, res, next) => {
    try {
        let { field, sort } = req.query;
        field = field ? snakecase(field) : '*';
        sort = sort ? snakecase(sort) : 'shipping_date, recipient_code, product_code, order_number';

        let filter = '1=1';
        if (req.query.orderNumber) {
            filter += ' AND order_number ILIKE ANY (to_array(${orderNumber}))';
        }

        if (req.query.productCode) {
            filter += ' AND product_code ILIKE ANY (to_array(${productCode}))';
        }

        if (req.query.shippingDateFrom) {
            filter += ' AND shipping_date >= ${shippingDateFrom}';
        }

        if (req.query.shippingDateTo) {
            filter += ' AND shipping_date <= ${shippingDateTo}';
        }

        const orders = await db.any(`
            SELECT ${field} FROM orders_cf
                WHERE ${filter} ORDER BY ${sort}
        `, req.query);

        res.status(200).json(orders);
    } catch (err) {
        next(err);
    }
});

module.exports = router;