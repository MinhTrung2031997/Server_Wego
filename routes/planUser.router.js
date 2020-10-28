const express = require('express');
const router = express.Router();
const planUserController = require('../controllers/planUser.controller');

router.post('/create_plan/:userId', planUserController.createPlan);
router.get('/get_plan_by_code/:userId/:code', planUserController.getPlanByCode);
router.get('/get_plan_by_trip_id/:tripId', planUserController.getPlanByTripId);
router.get('/get_all_plan/:userId/', planUserController.getAllPlan);
router.get('/delete_plan/:planId/', planUserController.deletePlan);
router.get('/remove_plan_in_trip/:planId/:tripId', planUserController.removePlanInTrip);
router.get('/get_plan_no_in_trip_by_user_id/:tripId/:userId', planUserController.getPlanNoInTripByUserId);
router.post('/update_plan_in_trip', planUserController.updatePlanInTrip);
router.post('/add_plan_in_trip', planUserController.addPlanInTrip);
module.exports = router;
