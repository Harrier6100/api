const express = require('express');
const router = express.Router();
const HttpError = require('@/errors/HttpError');
const db = require('@/config/db.postgres');
const snakecase = require('@/utils/snakecase');

router.get('/', async (req, res, next) => {
    try {
        const { adhesiveCode } = req.query;

        const adhesives = await db.any(`
            SELECT * FROM adhesives
                WHERE adhesive_code = \${adhesiveCode}
                    AND sequence_number != '00'
                ORDER BY adhesive_code, sequence_number
        `, { adhesiveCode });

        const recipes = [];
        for (const adhesive of adhesives) {
            const { adhesiveCode, materialCode } = adhesive;

            const recipe = await db.oneOrNone(`
                SELECT * FROM adhesive_recipes
                    WHERE adhesive_code = \${adhesiveCode}
                        AND material_code = \${materialCode}
            `, { adhesiveCode, materialCode });

            recipes.push(recipe);
        }

        const procs = await db.any(`
            SELECT * FROM adhesive_recipe_procs
                WHERE adhesive_code = \${adhesiveCode}
                ORDER BY sequence_number
        `, { adhesiveCode });

        const remarks = await db.any(`
            SELECT * FROM adhesive_recipe_remarks
                WHERE adhesive_code = \${adhesiveCode}
                ORDER BY sequence_number
        `, { adhesiveCode });

        res.status(200).json({ adhesives, recipes, procs, remarks });
    } catch (err) {
        next(err);
    }
});

module.exports = router;