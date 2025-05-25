const snakecase = (str) => {
    return str
        .replace(/([A_Z])/g, (match) => `_${match.toLowerCase()}`)
        .replace(/([A_Za_z])(?=\d)/g, '$1_');
};

module.exports = snakecase;