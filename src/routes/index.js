const express = require('express');
const router = express.Router();

router.use(require('@/controllers/auth'));
router.use(require('@/controllers/profile'));
router.use('/users', require('@/controllers/user'));

module.exports = router;