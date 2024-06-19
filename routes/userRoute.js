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

router.use(authController.authorize);
//user data routes for user (all role)
router.patch('/updatePassword', authController.updatePassword);
router.patch('/updateProfile', userController.updateProfile);
router.patch('/suspendProfile', userController.suspendProfile);
router.get('/getProfile', userController.setMe, userController.getProfile);

router.use(authController.restrictTo('admin'));
// user data routes for admin
router.route('/').get(userController.getAllUsers).post(userController.createUser);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
