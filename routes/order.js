const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all orders
router.get("/", (req, res) => {
  db.all("SELECT * FROM Orders", (err, orders) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(orders);
  });
});

// Get a single order by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM Orders WHERE id = ?", [id], (err, order) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    db.all(
      "SELECT * FROM Order_Items WHERE order_id = ?",
      [id],
      (err, items) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        order.items = items;
        res.json(order);
      }
    );
  });
});

// Create a new order
router.post("/add", (req, res) => {
  const { username, items, total_price } = req.body;
  console.log(
    items,
    items.reduce((sum, item) => sum + item.price, 0)
  );

  if (!username || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Invalid order data" });
    return;
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    const sqlOrder = "INSERT INTO Orders (username, total_price) VALUES (?, ?)";
    db.run(sqlOrder, [username, total_price], function (err) {
      if (err) {
        console.error("Error inserting into Orders:", err);
        db.run("ROLLBACK");
        res.status(500).json({ error: err.message });
        return;
      }

      const orderId = this.lastID;
      console.log("New Order ID:", orderId);

      const sqlOrderItem =
        "INSERT INTO Order_Items (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)";

      let hasError = false;

      items.forEach((item, index) => {
        if (hasError) return;

        db.run(sqlOrderItem, [orderId, item.id, 1, item.price], function (err) {
          if (err) {
            console.error(
              `Error inserting into Order_Items (item index ${index}):`,
              err
            );
            hasError = true;
            db.run("ROLLBACK");
            res.status(500).json({ error: err.message });
            return;
          }
        });
      });

      if (!hasError) {
        db.run("COMMIT", (err) => {
          if (err) {
            console.error("Error committing transaction:", err);
            res.status(500).json({ error: "Failed to commit transaction" });
            return;
          }
          res.json({ id: orderId });
        });
      }
    });
  });
});

// Update an order
router.post("/update/:id", (req, res) => {
  const { id } = req.params;
  const { username, items } = req.body;
  const total_price = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const sqlOrder =
    "UPDATE Orders SET username = ?, total_price = ? WHERE id = ?";
  db.run(sqlOrder, [username, total_price, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Delete old order items
    const sqlDeleteOrderItems = "DELETE FROM Order_Items WHERE order_id = ?";
    db.run(sqlDeleteOrderItems, [id], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Insert new order items
      const sqlOrderItem =
        "INSERT INTO Order_Items (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)";
      items.forEach((item) => {
        db.run(
          sqlOrderItem,
          [id, item.id, item.quantity, item.price * item.quantity],
          function (err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
          }
        );
      });
      res.json({ updatedID: id });
    });
  });
});

// Delete an order
router.post("/del/:id", (req, res) => {
  const { id } = req.params;

  // Delete order items first
  const sqlDeleteOrderItems = "DELETE FROM Order_Items WHERE order_id = ?";
  db.run(sqlDeleteOrderItems, [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Then delete the order
    const sqlDeleteOrder = "DELETE FROM Orders WHERE id = ?";
    db.run(sqlDeleteOrder, [id], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ deletedID: id });
    });
  });
});

module.exports = router;
