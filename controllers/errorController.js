exports.globalErrorHandler = (err, req, res, next) => {
    // custom error handler that overrides the default error handler
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
};
