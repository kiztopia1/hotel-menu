const express = require("express");
const router = express.Router();
const db = require("../db");

// New item form
router.get("/new", (req, res) => {
  db.all("SELECT * FROM Categories", (err, categories) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.render("item/add-item", { title: "Add Item", categories });
  });
});

// Get all items
router.get("/", (req, res) => {
  db.all("SELECT * FROM Items", (err, items) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(items);
  });
});

// Add a new item
router.post("/add", (req, res) => {
  const { name, img_url, price, cook_time, category_id } = req.body;
  const sql =
    "INSERT INTO Items (name, img_url, price, cook_time, category_id) VALUES (?, ?, ?, ?, ?)";
  db.run(sql, [name, img_url, price, cook_time, category_id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

// Delete an item
router.post("/del/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM Items WHERE id = ?";
  db.run(sql, id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deletedID: id });
  });
});

// Update an item
router.post("/update/:id", (req, res) => {
  const { id } = req.params;
  const { name, img_url, price, cook_time, category_id } = req.body;
  const sql =
    "UPDATE Items SET name = ?, img_url = ?, price = ?, cook_time = ?, category_id = ? WHERE id = ?";
  db.run(
    sql,
    [name, img_url, price, cook_time, category_id, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ updatedID: id });
    }
  );
});

module.exports = router;
