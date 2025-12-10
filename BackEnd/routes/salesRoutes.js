const express = require("express");
const { getSalesReport } = require("../controllers/salesReportController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/report", protect, authorize("admin"), getSalesReport);

module.exports = router;
