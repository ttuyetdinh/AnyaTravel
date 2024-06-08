const User = require('../models/userModel');
const wrapperAsync = require('../utils/wrapperAsync');
const jwt = require('jsonwebtoken');

exports.signup = wrapperAsync(async (req, res) => {
    const newUser = await User.create(req.body);

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
        status: 'success',
        token: token,
        data: {
            user: newUser,
        },
    });
});

exports.login = wrapperAsync((req, res, next) => {});
