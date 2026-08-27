const crypto = require("crypto");

/**
 * Generates a URL-safe random token, used for scholar invite links.
 */
function generateInviteToken() {
  return crypto.randomBytes(32).toString("hex");
}

module.exports = { generateInviteToken };
