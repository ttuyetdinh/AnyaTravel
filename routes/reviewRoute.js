const express = require('express');
const router = express.Router({ mergeParams: true });

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// POST /tour/234fad4/reviews
// POST /reviews
router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(authController.authorize, authController.restrictTo('user', 'admin'), reviewController.createReview);

module.exports = router;
