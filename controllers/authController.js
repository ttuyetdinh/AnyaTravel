const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const wrapperAsync = require('../utils/wrapperAsync');
const sendEmail = require('../utils/emailSender');

exports.signup = wrapperAsync(async (req, res) => {
    const newUser = await User.create(req.body);

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token: token,
        data: {
            user: newUser,
        },
    });
});

exports.login = wrapperAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email: email }).select('+password');
    // run correctPassword only if user exists becasues if not it will give an error
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 400));
    }

    // Create token
    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token: token,
    });
});

exports.logout = wrapperAsync(async (req, res) => {});

exports.forgotPassword = wrapperAsync(async (req, res) => {
    // get user based on input email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with that email address', 404));
    }

    // generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // send it to the user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.
                    \nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 minutes)',
            message: message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again later!', 500));
    }
});

exports.resetPassword = wrapperAsync(async (req, res, next) => {
    const reqToken = req.params.token;
    const hashedToken = crypto.createHash('sha256').update(reqToken).digest('hex');

    // get user from token
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    // update changedPasswordAt property for the user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // log the user in, create and send new JWT
    const jwtToken = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token: jwtToken,
    });
});

exports.updatePassword = wrapperAsync(async (req, res, next) => {
    // get user from collection
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // check if posted current password is correct
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }

    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save();

    // log user in, send JWT
    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token: token,
    });
});

// middleware to authorize the user
exports.authorize = wrapperAsync(async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
        return next(new AppError('You are not logged in! Please log in to get access'));
    }

    const token = req.headers.authorization.split(' ')[1];

    // Verify token: the error is handled by the global error handler and catched by the wrapperAsync
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist', 401));
    }

    // Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again', 401));
    }

    req.user = currentUser;
    next();
});

// middleware to restrict access to certain roles
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};

function signToken(id) {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
}

// ----------------------- Different approach -----------------------//
/** Method 2: similar to Method 1 but with a different approach
instead of using next() to pass the error to the global error handler
we can throw an error and let the wrapperAsync catch it */

// exports.login = wrapperAsync((req, res) => {
//     const { email, password } = req.body;

//     // Check if email and password exist
//     if (!email || !password) {
//         throw new AppError('Please provide email and password');
//     }
// });
