const express = require('express');
const router = express.Router();
const HttpError = require('@/errors/HttpError');
const db = require('@/config/db.postgres');
const snakecase = require('@/utils/snakecase');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'adhesive_code, sequence_number';

        let filter = '1=1';

        if (req.query.adhesiveCode) {
            filter += ' AND adhesive_code = ${adhesiveCode}';
        }

        if (req.query.materialCode) {
            filter += ' AND material_code = ${materialCode}';
        }

        const adhesives = await db.any(`
            SELECT ${field} FROM adhesives WHERE ${filter} ORDER BY ${sort}
        `, req.query);

        res.status(200).json(adhesives);
    } catch (err) {
        next(err);
    }
});

module.exports = router;