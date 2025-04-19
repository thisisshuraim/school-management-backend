const express = require("express");
const { getTeachers, createTeacher, updateTeacher, deleteTeacher } = require("../controllers/teacherController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const router = express.Router();

router.use(protect);
router.get("/", restrictTo("admin"), getTeachers);
router.post("/", restrictTo("admin"), createTeacher);
router.put("/:id", restrictTo("admin"), updateTeacher);
router.delete("/:id", restrictTo("admin"), deleteTeacher);

module.exports = router;