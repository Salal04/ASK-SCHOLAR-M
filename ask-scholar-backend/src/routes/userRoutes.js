const express = require("express");
const router = express.Router();

const { getMyProfile, updateMyProfile, changeMyPassword } = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate, authorize("USER"));

router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);
router.put("/me/password", changeMyPassword);

module.exports = router;
