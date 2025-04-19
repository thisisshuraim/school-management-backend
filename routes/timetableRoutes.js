const express = require("express");
const multer = require("multer");
const { getTimetables, uploadTimetable, updateTimetable, deleteTimetable } = require("../controllers/timetableController");
const { protect } = require("../middlewares/authMiddleware");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.use(protect);
router.get("/", getTimetables);
router.post("/", upload.single("file"), uploadTimetable);
router.put("/:id", updateTimetable);
router.delete("/:id", deleteTimetable);

module.exports = router;