const errorHandler = (err, req, res, next) => {
  const status = res.statusCode || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
};

module.exports = { errorHandler };