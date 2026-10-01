function notFoundHandler(req, res) {
  res
    .status(404)
    .json({ message: "Data atau endpoint yang diminta tidak ditemukan." });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.type === "entity.parse.failed") {
    // Body JSON tidak valid
    return res
      .status(400)
      .json({ message: "Body request tidak valid (JSON malformed)." });
  }

  console.error(err);

  if (process.env.NODE_ENV !== "production") {
    return res.status(500).json({
      message: err.message || "Terjadi kesalahan pada server.",
      stack: err.stack,
    });
  }

  return res.status(500).json({
    message: "Terjadi kesalahan pada server. Silakan coba lagi nanti.",
  });
}

module.exports = { notFoundHandler, errorHandler };
