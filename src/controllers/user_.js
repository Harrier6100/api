const express = require('express');
const router = express.Router();
const HttpError = require('@/errors/HttpError');
const db = require('@/utils/db');
const snakecase = require('@/utils/snakecase');

router.get('/search', async (req, res, next) => {
    let { field, sort } = req.query;
    field = field ? snakecase(field) : '*';
    sort = sort ? snakecase(sort) : 'id';

    let filter = '1=1';

    if (req.query.id) {
        filter += ' AND id = ${id}';
    }

    try {
        const users = await db.any(`
            SELECT ${field} FROM users
                WHERE ${filter} ORDER BY ${sort}
        `, req.query);

        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const users = await db.any(`
            SELECT * FROM users
        `);
        res.status(200).json(users.map(user => user.collection));
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        const user = await db.oneOrNone(`
            SELECT * FROM users WHERE collection->>'id' = \${id}
        `, { id });
        if (!user) throw new HttpError('アカウントが存在しません。', 404);
        res.status(200).json(user.collection);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    const {
        id,
        name,
        email,
        role,
        expiryDate,
        remarks,
        isRmoved,
    } = req.body;

    try {
        const exists = await db.oneOrNone(`
            SELECT * FROM users WHERE collection->>'id' = \${id}
        `, { id });
        if (exists) throw new HttpError('アカウントが既に存在します。', 409);
        
        const user = {};
        user.id = id;
        user.name = name;

        await db.none(`
            INSERT INTO users (collection) VALUES(\${user})
        `, { user });

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

module.exports = router;