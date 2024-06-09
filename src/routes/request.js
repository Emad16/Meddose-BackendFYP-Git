const express = require("express");
const router = express.Router();

const requestController = require("../controllers/requestController");

router.post("/", requestController.caretakerRequest);
router.get("/requests-by-creataker", requestController.getCaretakerRequest);
router.get("/requests-for-patient", requestController.getPatientRequest);
router.post("/update-request", requestController.updateCaretakerRequest);

module.exports = router;
