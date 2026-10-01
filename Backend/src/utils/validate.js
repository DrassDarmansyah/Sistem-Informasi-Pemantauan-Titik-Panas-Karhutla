const { validationResult } = require("express-validator");

/**
 * Menjalankan hasil express-validator dan, jika gagal, membalas 422 dengan
 * Mengembalikan `true` jika ada error (response sudah dikirim), `false` jika lolos.
 */
function respondIfInvalid(
  req,
  res,
  topMessage = "Data yang dikirim tidak valid.",
) {
  const result = validationResult(req);

  if (result.isEmpty()) return false;

  const errors = {};
  for (const err of result.array()) {
    const field = err.path || err.param;
    if (!errors[field]) errors[field] = [];
    errors[field].push(err.msg);
  }

  res.status(422).json({ message: topMessage, errors });
  return true;
}

module.exports = { respondIfInvalid };
