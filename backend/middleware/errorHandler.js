// Centralized error handler.
// Any route can call next(err) and it will be caught here instead of
// duplicating try/catch boilerplate and error-formatting in every route file.
module.exports = function errorHandler(err, req, res, next) {
  console.error(err.stack || err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    msg: err.message || "Server error",
  });
};
