const express = require('express');
const router = express.Router();
const commentRatingController = require('../controllers/commentRating.controller');

router.get('/get_comment_by_place', commentRatingController.getComment);

router.post('/insert_a_comment', commentRatingController.insertComment);

router.post('/insert_rating', commentRatingController.insertRating);

module.exports = router;
