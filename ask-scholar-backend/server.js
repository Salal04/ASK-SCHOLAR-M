require("dotenv").config();

const app = require("./src/app");
const { ensureAdminExists } = require("./src/utils/ensureAdmin");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Auto-create the single Admin account if the DB has none yet.
    await ensureAdminExists();

    app.listen(PORT, () => {
      console.log(`🚀 Ask Scholar API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
