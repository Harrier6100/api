const express = require('express');
const router = express.Router();

router.use('/auth', require('@/controllers/auth'));
router.use('/users', require('@/controllers/user'));
router.use('/physprop/names', require('@/controllers/physpropName'));

module.exports = router;