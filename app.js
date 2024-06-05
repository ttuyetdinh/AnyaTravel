const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const userRouter = require('./routes/userRoute');
const tourRouter = require('./routes/tourRoute');
const { globalErrorHandler } = require('./controllers/errorController');

const app = express();

// Middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.json());

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Route for undefined routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Handle errors
app.use(globalErrorHandler);

module.exports = app;
