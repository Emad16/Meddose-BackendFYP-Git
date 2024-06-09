const express = require("express");
const router = express.Router();

//------------ Importing Controllers ------------//
const userController = require("../controllers/userController");

router.get("/patients", userController.getPatients);
router.get("/patients-by-caretaker", userController.getPatientsByCaretaker);
router.get("/caretakers", userController.getCaretakers);
router.get(
  "/patients-without-caretaker",
  userController.getPatientsWithoutCareTakers
);
router.get("/upload", userController.s3Url);
router.get("/get-image-details", userController.getImageDetails);
router.get("/caretaker-by-id", userController.getCaretakerById);
router.get("/review-by-id", userController.getReviewById);
router.get("/get-reviews", userController.getReviews);
router.get("/get-patient-by-list", userController.getPatientsByList);
router.put("/update", userController.updateUser);
router.post("/create-category", userController.handleCategory);
router.post("/contact", userController.contactUs);
router.post("/create-review", userController.handleReview);
router.put("/update-category", userController.updateCategory);
router.get("/get-categories", userController.getCategory);
router.post("/delete-category", userController.deleteCategory);
router.get("/approve", userController.approveUser);

module.exports = router;
