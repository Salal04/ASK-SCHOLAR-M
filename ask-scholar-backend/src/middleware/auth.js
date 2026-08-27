const { verifyToken } = require("../utils/jwt");

/**
 * Verifies the Bearer JWT on the request and attaches the decoded
 * payload ({ id, email, role }) to req.user.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Provide a Bearer token.",
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
}

/**
 * Restricts access to specific roles. Use after `authenticate`.
 * Example: authorize("ADMIN"), authorize("ADMIN", "SCHOLAR")
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }

    next();
  };
}

module.exports = { authenticate, authorize };
