const express = require("express");
const router = express.Router();

const {
  browseScholars,
  getScholarById,
  getMyScholarProfile,
  updateMyScholarProfile,
  askScholar,
} = require("../controllers/scholarController");

const { authenticate, authorize } = require("../middleware/auth");
const { uploadScholarPicture } = require("../middleware/upload");

// Scholar self-service (must come before "/:id" so "me" isn't treated as an id)
router.get("/me", authenticate, authorize("SCHOLAR"), getMyScholarProfile);
router.put("/me", authenticate, authorize("SCHOLAR"), uploadScholarPicture.single("picture"), updateMyScholarProfile);

// Public: browse/search/filter + view a single profile
router.get("/", browseScholars);
router.get("/:id", getScholarById);
router.post("/askQuestion/:id", askScholar);

module.exports = router;
