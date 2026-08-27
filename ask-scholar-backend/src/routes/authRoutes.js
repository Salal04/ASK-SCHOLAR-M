const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  loginAdmin,
  loginScholar,
  completeScholarRegistration,
} = require("../controllers/authController");
const { uploadScholarPicture } = require("../middleware/upload");

// User
router.post("/user/register", registerUser);
router.post("/user/login", loginUser);

// Admin
router.post("/admin/login", loginAdmin);

// Scholar
router.post("/scholar/login", loginScholar);
// Scholar completes account setup using the inviteToken the admin generated.
// Accepts multipart/form-data so a profile picture can be attached.
router.post("/scholar/complete-registration", uploadScholarPicture.single("picture"), completeScholarRegistration);

module.exports = router;
