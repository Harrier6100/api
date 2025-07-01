const express = require('express');
const router = express.Router();

router.use('/auth', require('@/controllers/auth'));
router.use('/customers', require('@/controllers/customer'));
router.use('/physprops', require('@/controllers/physprop'));
router.use('/physprop/specs', require('@/controllers/physpropSpec'));
router.use('/products', require('@/controllers/product'));
router.use('/stocks', require('@/controllers/stock'));
router.use('/users', require('@/controllers/user'));

module.exports = router;