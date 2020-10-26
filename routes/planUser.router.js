const express = require('express');
const router = express.Router();
const planUserController = require('../controllers/planUser.controller');

router.post('/create_plan/:userId', planUserController.createPlan);
router.get('/get_plan_by_code/:userId/:code', planUserController.getPlanByCode);
router.get('/get_all_plan/:userId/', planUserController.getAllPlan);
router.get('/delete_plan/:planId/', planUserController.deletePlan);
module.exports = router;
