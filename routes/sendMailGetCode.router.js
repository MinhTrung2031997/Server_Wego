const express = require('express');
const router = express.Router();
const sendMailGetCode = require("../controllers/forgotPassword.controller");


router.post('/', sendMailGetCode.sendMailGetCode );

module.exports = router;
