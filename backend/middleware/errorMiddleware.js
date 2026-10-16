export function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID or field value";
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this unique value already exists";
  }

  if (statusCode >= 500) {
    console.error(err);
    message = "Internal server error";
  }

  res.status(statusCode).json({
    success: false,
    message
  });
}