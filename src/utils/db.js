const pgp = require('pg-promise')({
    receive: async ({ data, result, ctx }) => {
        if (data.length === 0) return;
        for (const index in data) {
            const newRow = {};
            const row = data[index];
            for (const key in row) {
                const camelcase = pgp.utils.camelize(key);
                newRow[camelcase] = row[key];
            }
            data[index] = newRow;
        }
    },
});

const types = pgp.pg.types;
types.setTypeParser(1114, (value) => value.replace('T', '').slice(0, 19) ?? null);
types.setTypeParser(1700, (value) => parseFloat(value));

module.exports = pgp(process.env.POSTGRES);