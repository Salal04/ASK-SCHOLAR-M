const multer = require("multer");

/**
 * Catches errors thrown/passed via next(err) anywhere in the app,
 * including Multer upload errors and Prisma known errors.
 */
function errorHandler(err, req, res, next) {
  console.error(err);

  // Multer errors (file too large, wrong type, etc.)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.message && err.message.includes("image files are allowed")) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Prisma unique constraint violation
  if (err.code === "P2002") {
    const field = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : err.meta?.target;
    return res.status(409).json({
      success: false,
      message: `A record with this ${field || "value"} already exists.`,
    });
  }

  // Prisma record not found
  if (err.code === "P2025") {
    return res.status(404).json({ success: false, message: "Record not found." });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error.",
  });
}

function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
