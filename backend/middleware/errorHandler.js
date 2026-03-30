function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack || message);
  }
  res.status(status).json({ success: false, error: message, code: err.code });
}

module.exports = { errorHandler };
