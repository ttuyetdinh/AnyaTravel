const express = require('express');
const router = express.Router();

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoute');

// redirect to review route
router.use('/:tourId/reviews', reviewRouter);

// route order important in express. Express will go from top to bottom and stop when it finds a match
router.route('/tour-stats').get(tourController.getToursStats);
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router.route('/').get(authController.authorize, tourController.getAllTours).post(tourController.createTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(authController.authorize, authController.restrictTo('admin', 'user'), tourController.deleteTour);

module.exports = router;
