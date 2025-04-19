const express = require("express");
const multer = require("multer");
const { getAssignments, uploadAssignment, updateAssignment, deleteAssignment } = require("../controllers/assignmentController");
const { protect } = require("../middlewares/authMiddleware");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.use(protect);
router.get("/", getAssignments);
router.post("/", upload.single("file"), uploadAssignment);
router.put("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);

module.exports = router;