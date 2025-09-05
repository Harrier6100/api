const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const readDir = path.join(__dirname, 'modules');
const routes = (dir, route = '') => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const modulePath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            const newDir = path.join(route, entry.name);
            routes(modulePath, newDir);
        } else {
            const routeName = path.basename(entry.name, '.js');
            const routePath = path.join(route, routeName);
            const routeModule = require(modulePath);
            router.use(routePath.startsWith('/') ? routePath : '/' + routePath, routeModule);
        }
    }
};
routes(readDir);

module.exports = router;