const express = require("express");
const router = express.Router();
const db = require("../db");

// Route to render the form to add a new admin
router.get("/new", (req, res) => {
  res.render("admin/add-admin"); // Render add-admin.ejs
});

// Route to fetch admin data by ID and render the edit form
router.get("/:id/edit", (req, res) => {
  const adminId = req.params.id;
  const query = "SELECT * FROM Admin WHERE id = ?";

  db.get(query, [adminId], (err, admin) => {
    if (err) {
      console.error("Error fetching admin:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.render("admin/edit-admin", { admin });
  });
});

// CREATE: Add a new admin
router.post("/", (req, res) => {
  const { username, password } = req.body;
  const query = "INSERT INTO Admin (username, password) VALUES (?, ?)";
  db.run(query, [username, password], function (err) {
    if (err) {
      console.error("Error adding admin:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.redirect("/admins");
  });
});

// READ: Get all admins
router.get("/", (req, res) => {
  const query = "SELECT * FROM Admin";
  db.all(query, (err, rows) => {
    if (err) {
      console.error("Error fetching admins:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.render("admin/admin-list", { admins: rows });
  });
});

// UPDATE: Update an existing admin by ID
router.post("/edit/:id", (req, res) => {
  const adminId = req.params.id;
  const { username, password } = req.body;
  console.log(adminId, username, password);
  const query = "UPDATE Admin SET username = ?, password = ? WHERE id = ?";
  db.run(query, [username, password, adminId], function (err) {
    if (err) {
      console.error("Error updating admin:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.redirect("/admins");
  });
});

// DELETE: Delete an admin by ID
router.post("/del/:id", (req, res) => {
  const adminId = req.params.id;
  const query = "DELETE FROM Admin WHERE id = ?";
  db.run(query, [adminId], function (err) {
    if (err) {
      console.error("Error deleting admin:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.redirect("/admins");
  });
});

module.exports = router;
