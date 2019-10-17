const express = require('express');
const router = express.Router();
const forgotPassword = require("../controllers/forgotPassword.controller");


router.post('/',  forgotPassword.forgotPassword);
module.exports = router;
