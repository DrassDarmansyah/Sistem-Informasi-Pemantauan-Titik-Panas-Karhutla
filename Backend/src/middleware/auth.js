const { PersonalAccessToken, User, Wilayah } = require("../models");
const { parseBearerToken, hashToken } = require("../utils/token");

async function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, raw] = header.split(" ");

  if (scheme !== "Bearer" || !raw) {
    return res.status(401).json({ message: "Unauthenticated." });
  }

  const parsed = parseBearerToken(raw);
  if (!parsed) {
    return res.status(401).json({ message: "Unauthenticated." });
  }

  const tokenRecord = await PersonalAccessToken.findOne({
    where: { id: parsed.id },
  });

  if (!tokenRecord || tokenRecord.token !== hashToken(parsed.plainTextToken)) {
    return res.status(401).json({ message: "Unauthenticated." });
  }

  if (
    tokenRecord.expires_at &&
    new Date(tokenRecord.expires_at).getTime() < Date.now()
  ) {
    return res.status(401).json({ message: "Unauthenticated." });
  }

  const user = await User.findByPk(tokenRecord.tokenable_id, {
    include: [{ model: Wilayah, as: "wilayah" }],
  });

  if (!user) {
    return res.status(401).json({ message: "Unauthenticated." });
  }

  tokenRecord.last_used_at = new Date();
  await tokenRecord.save();

  req.user = user;
  req.accessToken = tokenRecord;

  next();
}

module.exports = authenticate;
