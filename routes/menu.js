const express = require("express");
const router = express.Router();
const db = require("../db");
const { isAuthenticated } = require("../middleware/auth");
// Render form to create a new hall
router.get("/", isAuthenticated, (req, res) => {
  res.render("menu", { title: "menu" }); // Assuming your EJS file is named new-hall.ejs and is located in the views directory
});
module.exports = router;
