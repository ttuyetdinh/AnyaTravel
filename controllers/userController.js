const User = require('../models/userModel');
const wrapperAsync = require('../utils/wrapperAsync');
const tools = require('../utils/tools');

//  -----------------------user routes-----------------------
exports.getProfile = wrapperAsync(async (req, res) => {
    const user = await User.findById(req.user.id);

    const filteredUser = tools.filterFields(user.toObject(), ['name', 'email', 'photo'], 'include', true);

    res.status(200).json({
        status: 'success',
        data: {
            user: filteredUser,
        },
    });
});
exports.updateProfile = wrapperAsync(async (req, res) => {
    const filteredBody = tools.filterFields(req.body, ['name', 'email', 'photo']);

    const user = await User.findById(req.user.id);
    Object.assign(user, filteredBody);
    await user.save({ validateModifiedOnly: true });

    res.status(200).json({
        status: 'success',
        data: {
            user: user,
        },
    });
});

exports.suspendProfile = wrapperAsync(async (req, res) => {
    const user = await User.findById(req.user.id);
    user.active = false;
    await user.save({ validateModifiedOnly: true });

    res.status(200).json({
        status: 'success',
        data: null,
    });
});

//  -----------------------admin routes-----------------------
exports.getAllUsers = wrapperAsync(async (req, res) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        data: {
            users: users,
        },
    });
});

exports.createUser = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: 'will create new user',
        },
    });
};

exports.getUser = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: 'will return user',
        },
    });
};

exports.updateUser = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: 'will update user',
        },
    });
};

exports.deleteUser = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: 'will delete user',
        },
    });
};
