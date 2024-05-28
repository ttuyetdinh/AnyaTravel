const express = require('express');
const dotnev = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const userRouter = require('./routes/userRoute');
const tourRouter = require('./routes/tourRoute');

dotnev.config({ path: './config.env' });

const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(db).then(() => console.log('DB connection successful!'));

const app = express();

// Middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.json());

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
