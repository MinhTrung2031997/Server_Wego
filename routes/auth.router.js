const express = require('express');
const router = express.Router();
const Authentication = require('../middleware/check-auth');

router.post('/', Authentication.checkAuth);

module.exports = router;
