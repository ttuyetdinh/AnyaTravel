const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    photo: {
        type: String,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email',
        },
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [3, 'Password must have at least 3 characters'],
        trim: true,
        select: false, // not getting the password when querying the database
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Password confirm is required'],
        validate: {
            validator: function (val) {
                return val === this.password;
            },
            message: 'Passwords do not match',
        },
    },
    passwordChangedAt: {
        type: Date,
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetExpires: {
        type: Date,
    },
});

// db middleware to hash the password before saving it to the database
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
        this.passwordConfirm = undefined;
    }
    next();
});
// db middleware to update the passwordChangedAt property when the password is changed
userSchema.pre('save', function (next) {
    if (this.isModified('password') && !this.isNew) {
        this.passwordChangedAt = Date.now() - 1000; // 1 second before the token was issued
    }
    next();
});

// user schema method: compare the user input password with the hashed password in the database
userSchema.methods.correctPassword = async function (candidatePassword, hashedPassword) {
    const caPass = candidatePassword?.toString() ?? '';
    const haPass = hashedPassword?.toString() ?? '';
    return await bcrypt.compare(caPass, haPass);
};

// user schema method: check if the user changed the password after the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// user schema method: create a password reset token
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
