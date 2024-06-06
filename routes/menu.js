const express = require("express");
const router = express.Router();
const db = require("../db");

// Render form to create a new hall
router.get("/", (req, res) => {
  res.render("menu", { title: "menu" }); // Assuming your EJS file is named new-hall.ejs and is located in the views directory
});
module.exports = router;
