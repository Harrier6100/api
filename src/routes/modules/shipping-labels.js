const express = require('express');
const router = express.Router();
const HttpError = require('@/errors/HttpError');
const db = require('@/config/db.postgres');

router.get('/:orderNumber/sagawa', async (req, res, next) => {
    try {
        const { orderNumber } = req.params;

        const order = await db.oneOrNone(`
            SELECT * FROM orders
                WHERE order_number = \${orderNumber}
                    AND sales_status = 'Y'
                    AND status != 'H'
        `, { orderNumber });

        if (!order) {
            throw new HttpError('受注データがみつかりません。', 404);
        }

        const shipTo = await db.oneOrNone(`
            SELECT * FROM customers
                WHERE customer_code = \${customerCode}
        `, { customerCode: order.shipToCode });

        if (!shipTo) {
            throw new HttpError('出荷先情報がみつかりません。', 404);
        }

        const shippingPlan = await db.oneOrNone(`
            SELECT * FROM shipping_plans
                WHERE order_number = \${orderNumber}
                    AND shipping_date >= \${shippingDate}
                    AND status != 'C'
        `, { orderNumber: order.orderNumber, shippingDate: order.shippingDate });

        if (!shippingPlan) {
            throw new HttpError('出荷計画がみつかりません。', 404);
        }

        const shippingRecords = await db.result(`
            SELECT DISTINCT
                record_id, sum(shipping_qty) OVER (PARTITION BY plan_id) AS shipping_qty
            FROM shipping_records
                WHERE plan_id = \${planId}
                    AND status = '1'
        `, { planId: shippingPlan.planId })

        if (shippingRecords.rowCount === 0) {
            throw new HttpError('出荷日報がみつかりません。', 404);
        }

        const shipping = {};
        shipping.shippingQty = Number(shippingRecords.rows[0].shippingQty);
        shipping.cartonQty = shippingRecords.rowCount;

        res.status(200).json({ order, shipTo, shipping });
    } catch (err) {
        next(err);
    }
});

module.exports = router;