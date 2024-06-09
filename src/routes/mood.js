const express = require("express");
const router = express.Router();

const moodController = require("../controllers/moodController");

router.post("/", moodController.addMoodList);
router.get("/", moodController.getMoodList);
router.post("/patient-mood", moodController.addPatientMood);
router.get("/patient-mood", moodController.getPatientMood);

module.exports = router;
