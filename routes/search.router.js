const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

router.get('/get_data_search', searchController.getDataSearch); 
router.get('/search_location/:textSearch', searchController.searchLocation);
router.get('/get_detail_location/:code', searchController.getDetailLocation);
router.get('/get_plan_location/:code', searchController.getPlanLocation);
router.get('/get_main_location', searchController.getMainLocation);
router.post('/optimize_route_location', searchController.optimizeRoute);

module.exports = router;