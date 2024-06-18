const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const userRouter = require('./routes/userRoute');
const tourRouter = require('./routes/tourRoute');
const reviewRouter = require('./routes/reviewRoute');
const { globalErrorHandler } = require('./controllers/errorController');

const { limiterConfig } = require('./configurations/ipLimitConfiguration');

const app = express();

//---------------- Global Middleware ----------------
// Set security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit requests from the same IP
app.use('/api', limiterConfig);

// Body parser, reading data from body into req.body, limit the body to 100kb
app.use(express.json({ limit: '100kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
// this will remove duplicate queries, but it will also remove the ability to filter by the same query
//=> So use it with caution
// app.use(hpp());

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// Route for undefined routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Handle errors
app.use(globalErrorHandler);

module.exports = app;
