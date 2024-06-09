const express = require("express");
const router = express.Router();

const medicationController = require("../controllers/medicationController");

router.post("/", medicationController.addMedication);
router.get("/", medicationController.getMedications);
router.get("/archive", medicationController.getArchivedMedications);

module.exports = router;
