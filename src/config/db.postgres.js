const pgp = require('pg-promise')({
    receive({ data }) {
        if (!data.length) return;

        // 完全移行
        // data.forEach((row, i) => {
        //     data[i] = Object.fromEntries(
        //         Object.entries(row).map(([column, value]) =>
        //             [pgp.utils.camelize(column), value]
        //         )
        //     );
        // });

        // 移行措置
        data.forEach((row, i) => {
            const camelize = {};
            for (const [column, value] of Object.entries(row)) {
                const camelKey = pgp.utils.camelize(column);
                camelize[camelKey] = value;
                camelize[column] = value;
            }
            data[i] = camelize;
        });
    }
});

const types = pgp.pg.types;
types.setTypeParser(1114, (value) => value.replace('T', '').slice(0, 19) ?? null);
types.setTypeParser(1700, (value) => parseFloat(value));
const db = pgp(process.env.POSTGRES);

module.exports = db;