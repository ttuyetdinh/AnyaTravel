const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// authorization/authentication routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updatePassword', authController.authorize, authController.updatePassword);

//user data routes for user
router.patch('/updateProfile', authController.authorize, userController.updateProfile);
router.patch('/suspendProfile', authController.authorize, userController.suspendProfile);
router.get('/getProfile', authController.authorize, userController.setMe, userController.getProfile);

// user data routes for admin
router.route('/').get(userController.getAllUsers).post(userController.createUser);
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(authController.authorize, authController.restrictTo('admin'), userController.deleteUser);

module.exports = router;
