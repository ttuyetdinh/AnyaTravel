const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

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
});

// db middleware to hash the password before saving it to the database
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
        this.passwordConfirm = undefined;
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
