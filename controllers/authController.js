const User = require('../models/userModel');
const AppError = require('../utils/appError');
const wrapperAsync = require('../utils/wrapperAsync');
const jwt = require('jsonwebtoken');

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
