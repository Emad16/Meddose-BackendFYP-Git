const express = require("express");
const router = express.Router();

const scheduleController = require("../controllers/scheduleController");

router.post("/", scheduleController.addSchedule);
router.get("/", scheduleController.getSchedule);

module.exports = router;
