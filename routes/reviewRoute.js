const express = require('express');
const router = express.Router({ mergeParams: true });

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// crud /tour/234fad4/reviews
// crud /reviews
router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.authorize,
        authController.restrictTo('user', 'admin'),
        reviewController.setTourUserIds,
        reviewController.createReview,
    );

router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(authController.authorize, authController.restrictTo('user', 'admin'), reviewController.updateReview)
    .delete(authController.authorize, authController.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = router;
