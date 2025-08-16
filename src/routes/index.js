const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, 'modules');
const moduleFiles = fs.readdirSync(modulesDir).filter(file => file.endsWith('.js'));
moduleFiles.forEach(file => {
    const routePath = '/' + path.basename(file, '.js');
    const routeModule = require(path.join(modulesDir, file));
    router.use(routePath, routeModule);
});

module.exports = router;