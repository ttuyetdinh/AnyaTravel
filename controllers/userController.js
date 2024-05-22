exports.getAllUsers = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: 'will return list of users',
        },
    });
};

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
