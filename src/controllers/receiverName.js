const express = require('express');
const router = express.Router();
const HttpError = require('@/errors/HttpError');
const db = require('@/config/db.postgres');
const snakecase = require('@/utils/snakecase');

router.get('/search', async (req, res, next) => {
    let { field, sort } = req.query;
    field = field ? snakecase(field) : '*';
    sort = sort ? snakecase(sort) : 'receiver_code';

    let filter = '1=1';

    if (req.query.receiverCode) {
        filter += ' AND receiver_code ILIKE ANY (to_array(${receiverCode}))';
    }

    if (req.query.receiverName) {
        filter += ' AND receiver_name ILIKE ANY (to_array(${receiverName}))';
    }

    try {
        const receiverNames = await db.any(`
            SELECT ${field} FROM receiver_names
                WHERE ${filter} ORDER BY ${sort}
        `, req.query);

        res.status(200).json(receiverNames);
    } catch (err) {
        next(err);
    }
});

router.get('/:receiverCode', async (req, res, next) => {
    const { receiverCode } = req.params;

    try {
        const receiverName = await db.oneOrNone(`
            SELECT * FROM receiver_names
                WHERE receiver_code = \${receiverCode}
        `, { receiverCode });

        if (!receiverName) {
            throw new HttpError('レコードが存在しません。', 404);
        }

        res.status(200).json(receiverName);
    } catch (err) {
        next(err);
    }
});

module.exports = router;