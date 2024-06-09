const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/checkAuth");

//------------ Welcome Route ------------//
router.get("/", (req, res) => {
  // res.redirect("/api");
  // res.render("welcome");
  // console.log("Welcome");
  res.json({ success: true });
});
module.exports = router;
