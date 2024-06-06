const express = require("express");
const router = express.Router();
const db = require("../db");

// Render form to create a new hall
router.get("/new", (req, res) => {
  res.render("new-hall"); // Assuming your EJS file is named new-hall.ejs and is located in the views directory
});

// Route to fetch hall data by ID and render edit form
router.get("/:id/edit", (req, res) => {
  const hallId = req.params.id;
  const query = "SELECT * FROM halls WHERE id = ?";

  db.get(query, [hallId], (err, hall) => {
    if (err) {
      console.error("Error fetching hall:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (!hall) {
      return res.status(404).json({ message: "Hall not found" });
    }
    res.render("edit-hall", { hall });
  });
});

// CREATE: Add a new hall
router.post("/", (req, res) => {
  const { name, capacity, price } = req.body;
  const query = "INSERT INTO halls (name, capacity, price) VALUES (?, ?, ?)";
  db.run(query, [name, capacity, price], function (err) {
    if (err) {
      console.error("Error adding hall:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    const hallId = this.lastID;
    res.redirect("/");
  });
});

// READ: Get all halls
router.get("/", (req, res) => {
  const query = "SELECT * FROM halls";
  db.all(query, (err, rows) => {
    if (err) {
      console.error("Error fetching halls:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.json(rows);
  });
});

// READ: Get a specific hall by ID
router.get("/:id", (req, res) => {
  const hallId = req.params.id;
  const query = "SELECT * FROM halls WHERE id = ?";
  db.get(query, [hallId], (err, row) => {
    if (err) {
      console.error("Error fetching hall:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (!row) {
      return res.status(404).json({ message: "Hall not found" });
    }
    res.json(row);
  });
});

// UPDATE: Update an existing hall by ID
router.post("/edit/:id", (req, res) => {
  const hallId = req.params.id;
  const { name, capacity, price } = req.body;
  const query =
    "UPDATE halls SET name = ?, capacity = ? , price = ? WHERE id = ?";
  db.run(query, [name, capacity, price, hallId], function (err) {
    if (err) {
      console.error("Error updating hall:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.redirect("/");
  });
});

// DELETE: Delete a hall by ID
router.post("/del/:id", (req, res) => {
  const hallId = req.params.id;
  const query = "DELETE FROM halls WHERE id = ?";
  db.run(query, [hallId], function (err) {
    if (err) {
      console.error("Error deleting hall:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.status(204).send(); // No content
  });
});

module.exports = router;
