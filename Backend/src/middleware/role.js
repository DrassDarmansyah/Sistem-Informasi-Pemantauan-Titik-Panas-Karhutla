function requireRole(role) {
  return (req, res, next) => {
    const user = req.user;

    if (!user || user.role !== role) {
      return res.status(403).json({
        message: "Anda tidak memiliki akses ke resource ini.",
      });
    }

    next();
  };
}

module.exports = requireRole;
