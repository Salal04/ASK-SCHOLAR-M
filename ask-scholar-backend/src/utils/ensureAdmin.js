const prisma = require("../config/prisma");
const { hashPassword } = require("./password");

/**
 * Ensures exactly one Admin account exists. Runs on every server start.
 * Credentials come from environment variables so they can be rotated
 * without touching code. If an admin already exists, this is a no-op.
 */
async function ensureAdminExists() {
  const adminCount = await prisma.admin.count();

  if (adminCount > 0) {
    console.log("Admin account already exists — skipping auto-creation.");
    return;
  }

  const name = process.env.ADMIN_NAME || "Super Admin";
  const email = (process.env.ADMIN_EMAIL || "admin@askscholar.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeThisPassword123!";

  const hashed = await hashPassword(password);

  await prisma.admin.create({
    data: { name, email, password: hashed },
  });

  console.log("=================================================");
  console.log("✔ Default Admin account created automatically:");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log("  (set ADMIN_EMAIL / ADMIN_PASSWORD in .env to change these)");
  console.log("=================================================");
}

module.exports = { ensureAdminExists };
