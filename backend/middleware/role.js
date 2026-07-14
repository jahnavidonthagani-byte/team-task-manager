// Usage: role("admin") or role("admin", "member")
// Roles are always compared lowercase so it doesn't matter how they were
// entered/stored.
module.exports = function (...roles) {
  const allowed = roles.map((r) => r.toLowerCase());

  return (req, res, next) => {
    const userRole = req.user && req.user.role ? req.user.role.toLowerCase() : "";

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        msg: "Access Denied: You do not have permission to perform this action",
      });
    }

    next();
  };
};
