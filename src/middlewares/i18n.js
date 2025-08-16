const fs = require('fs');
const path = require('path');

const locales = {};
['ja', 'en'].forEach(lang => {
    const file = path.join(__dirname, '../config/locales', lang + '.json');
    locales[lang] = JSON.parse(fs.readFileSync(file, 'utf8'));
});

const i18n = (req, res, next) => {
    const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'ja';
    req.lang = lang;

    req.t = (key) => {
        return locales[lang]?.[key] || key;
    };

    next();
};

module.exports = i18n;