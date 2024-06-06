const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  console.log("ahah");
  res.render("auth/login");
});

router.post("/login", (req, res) => {
  const { name, password } = req.body;
  const query = "SELECT * FROM admins WHERE name = ? AND password = ?";

  db.get(query, [name, password], (err, admin) => {
    if (err) {
      console.error("Error fetching admin:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.adminId = admin.id;
    res.redirect("/");
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err.message);
    }
    res.redirect("/");
  });
});

module.exports = router;
