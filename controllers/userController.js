const User = require('../models/userModel');
const wrapperAsync = require('../utils/wrapperAsync');
const tools = require('../utils/tools');
const factory = require('./controllerFactory');

// middleware
exports.setMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

//  -----------------------user routes-----------------------

exports.getProfile = factory.getOne(User, null, ['name', 'email', 'photo'], 'include', false);

exports.updateProfile = wrapperAsync(async (req, res) => {
    const filteredBody = tools.filterFields(req.body, ['name', 'email', 'photo'], false);

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

//  -----------------------admin routes----------------------------

exports.getUser = factory.getOne(User);

exports.getAllUsers = factory.getAll(User);

exports.createUser = factory.createOne(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
