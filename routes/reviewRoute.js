const express = require('express');
const router = express.Router({ mergeParams: true });

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// crud /tour/234fad4/reviews
// crud /reviews
router.use(authController.authorize);

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(authController.restrictTo('user', 'admin'), reviewController.setTourUserIds, reviewController.createReview);

router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = router;
