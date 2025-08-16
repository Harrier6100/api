const snakecase = (str) => {
    return str
        .replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`)
        .replace(/([A-Za-z])(?=\d)/g, '$1_');
};

module.exports = snakecase;