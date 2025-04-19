const express = require("express");
const { getStudents, createStudent, updateStudent, deleteStudent } = require("../controllers/studentController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const router = express.Router();

router.use(protect);
router.get("/", restrictTo("admin"), getStudents);
router.post("/", restrictTo("admin"), createStudent);
router.put("/:id", restrictTo("admin"), updateStudent);
router.delete("/:id", restrictTo("admin"), deleteStudent);

module.exports = router;