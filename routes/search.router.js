const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

router.get('/get_data_search', searchController.getDataSearch);

module.exports = router;