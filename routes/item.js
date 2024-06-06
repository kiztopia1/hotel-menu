const express = require("express");
const router = express.Router();
const db = require("../db");

// Render the new item form
router.get("/new", (req, res) => {
  db.all("SELECT * FROM Categories", (err, categories) => {
    if (err) {
      console.error("Error fetching categories:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.render("item/add-item", { title: "Add Item", categories });
  });
});

// Render the edit item form
router.get("/:id/edit", (req, res) => {
  const itemId = req.params.id;
  const itemQuery = "SELECT * FROM Items WHERE id = ?";
  const categoriesQuery = "SELECT * FROM Categories";

  Promise.all([
    new Promise((resolve, reject) => {
      db.get(itemQuery, [itemId], (err, item) => {
        if (err) reject(err);
        resolve(item);
      });
    }),
    new Promise((resolve, reject) => {
      db.all(categoriesQuery, (err, categories) => {
        if (err) reject(err);
        resolve(categories);
      });
    }),
  ])
    .then(([item, categories]) => {
      console.log(item, itemId);
      res.render("item/edit-item", { item, categories });
    })
    .catch((err) => {
      console.error("Error fetching item details and categories:", err);
      res.status(500).json({ message: "Internal server error" });
    });
});

// Get all items (API route)
router.get("/", (req, res) => {
  const query = "SELECT * FROM Items";
  db.all(query, (err, items) => {
    if (err) {
      console.error("Error fetching items:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.json(items);
  });
});

// Add a new item (API route)
router.post("/add", (req, res) => {
  const { name, img_url, price, cook_time, category_id } = req.body;
  const sql =
    "INSERT INTO Items (name, img_url, price, cook_time, category_id) VALUES (?, ?, ?, ?, ?)";
  db.run(sql, [name, img_url, price, cook_time, category_id], function (err) {
    if (err) {
      console.error("Error adding item:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.json({ id: this.lastID });
  });
});

// Delete an item (API route)
router.post("/del/:id", (req, res) => {
  const itemId = req.params.id;
  const sql = "DELETE FROM Items WHERE id = ?";
  db.run(sql, itemId, function (err) {
    if (err) {
      console.error("Error deleting item:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.json({ deletedID: itemId });
  });
});

// Update an item (API route)
router.post("/update/:id", (req, res) => {
  const itemId = req.params.id;
  const { name, img_url, price, cook_time, category_id } = req.body;
  const sql =
    "UPDATE Items SET name = ?, img_url = ?, price = ?, cook_time = ?, category_id = ? WHERE id = ?";
  db.run(
    sql,
    [name, img_url, price, cook_time, category_id, itemId],
    function (err) {
      if (err) {
        console.error("Error updating item:", err.message);
        return res.status(500).json({ message: "Internal server error" });
      }
      res.json({ updatedID: itemId });
    }
  );
});

module.exports = router;
