const express = require("express");
const router = express.Router();

const {
  createScholarFull,
  inviteScholar,
  resendScholarInvite,
  listScholarsAdmin,
  listUsersAdmin,
  deleteScholar,
  deleteUser,
  setScholarActiveStatus,
  videos_url,
} = require("../controllers/adminController");

const { authenticate, authorize } = require("../middleware/auth");
const { uploadScholarPicture } = require("../middleware/upload");

// Every route below requires a valid ADMIN token
router.use(authenticate, authorize("ADMIN"));

// Scholar management
router.post("/scholars", uploadScholarPicture.single("picture"), createScholarFull); // full account creation
router.post("/scholars/invite", inviteScholar); // email-only invite
router.post("/scholars/:id/resend-invite", resendScholarInvite);
router.get("/scholars", listScholarsAdmin);
router.patch("/scholars/:id/status", setScholarActiveStatus); // suspend/reactivate
router.delete("/scholars/:id", deleteScholar);
router.post("/videos/", videos_url);

// User management
router.get("/users", listUsersAdmin);
router.delete("/users/:id", deleteUser);

module.exports = router;
