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

exports.globalErrorHandler = (err, req, res, next) => {
    // custom error handler that overrides the default error handler
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };

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
        sendErrorProd(err, res);
    }
};
