exports.errorHandler = (error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    return res.status(status).json({ message, data });
};
