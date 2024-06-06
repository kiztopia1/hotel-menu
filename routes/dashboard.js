// routes/dashboard.js

const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");

// Route to render the dashboard
router.get("/", isAuthenticated, (req, res) => {
  res.render("dashboard");
});

module.exports = router;
