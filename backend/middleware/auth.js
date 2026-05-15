const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {

  try {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {

      return res.status(401).json({
        msg: "No token"
      });
    }

    // REMOVE "Bearer "
    const token =
      authHeader.split(" ")[1];

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.user = decoded;

    next();

  } catch (err) {

    res.status(401).json({
      msg: "Invalid token"
    });
  }
};