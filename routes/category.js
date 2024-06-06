const express = require("express");
const router = express.Router();
const db = require("../db");

// New category form
router.get("/new", (req, res) => {
  res.render("category/new-category", { title: "Add Category" });
});

// Get all categories
router.get("/", (req, res) => {
  db.all("SELECT * FROM Categories", (err, categories) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(categories);
  });
});

// Add a new category
router.post("/add", (req, res) => {
  const { name } = req.body;
  const sql = "INSERT INTO Categories (name) VALUES (?)";
  db.run(sql, [name], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

// Delete a category
router.post("/del/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM Categories WHERE id = ?";
  db.run(sql, id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deletedID: id });
  });
});

// Update a category
router.post("/update/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const sql = "UPDATE Categories SET name = ? WHERE id = ?";
  db.run(sql, [name, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ updatedID: id });
  });
});

module.exports = router;
