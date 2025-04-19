const express = require("express");
const multer = require("multer");
const { getMarksheets, uploadMarksheet, deleteMarksheet } = require("../controllers/marksheetController");
const { protect } = require("../middlewares/authMiddleware");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.use(protect);
router.get("/", getMarksheets);
router.post("/", upload.single("file"), uploadMarksheet);
router.delete("/:id", deleteMarksheet);

module.exports = router;