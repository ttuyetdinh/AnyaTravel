const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack, // stack trace
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // Programming or other unknown error: don't leak error details
        console.log('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!',
        });
    }
};

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

// Express error handling middleware has 4 parameters, if not express will not recognize it as an error handling middleware
exports.globalErrorHandler = (err, req, res, next) => {
    // custom error handler that overrides the default error handler
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err, message: err.message, stack: err.stack };

        // handle wrong format when casting
        if (error.name === 'CastError') {
            error = handleCastErrorDB(error);
        }
        // handle duplicate fields
        if (error.code === 11000) {
            error = handleDuplicateFieldsDB(error);
        }
        // handle validation errors
        if (error.name === 'ValidationError') {
            error = handleValidationErrorDB(error);
        }
        // handle JWT errors
        if (error.name === 'JsonWebTokenError') {
            error = handleJWTError();
        }
        // handle JWT expired errors
        if (error.name === 'TokenExpiredError') {
            error = handleJWTExpiredError();
        }

        sendErrorProd(error, res);
    }
};
