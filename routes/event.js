const express = require("express");
const router = express.Router();
const db = require("../db");

// ejs web pages
router.get("/new", (req, res) => {
  res.render("event/new-event"); // Assuming your EJS file is named new-event.ejs and is located in the views directory
});

router.get("/:id/edit", (req, res) => {
  const eventId = req.params.id;
  const query = "SELECT * FROM events WHERE id = ?";

  db.get(query, [eventId], (err, event) => {
    if (err) {
      console.error("Error fetching event:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.render("event/edit-event", { event }); // Render the edit-event.ejs view
  });
});
// api routes

// CREATE: Add a new event

router.post("/", (req, res) => {
  const {
    name,
    type,
    owner_full_name,
    owner_phone,
    address,
    start_date,
    end_date,
    "halls[]": halls,
    customers,
    employees,
  } = req.body;

  // Check if halls is a string, if so, convert it to an array with a single element
  const hallsArray = Array.isArray(halls) ? halls : [halls];

  // Begin manual transaction
  db.serialize(() => {
    // Start the transaction
    db.run("BEGIN TRANSACTION");

    // Insert event details into events table
    const eventQuery =
      "INSERT INTO events (name, type, owner_full_name, owner_phone, address, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.run(
      eventQuery,
      [name, type, owner_full_name, owner_phone, address, start_date, end_date],
      function (err) {
        if (err) {
          console.error("Error adding event:", err.message);
          // Rollback the transaction if there's an error
          db.run("ROLLBACK");
          return res.status(500).json({ message: "Internal server error" });
        }
        const eventId = this.lastID;

        // Insert halls for the event into the event_halls table
        const insertHallsQuery =
          "INSERT INTO event_halls (event_id, hall_id) VALUES (?, ?)";
        hallsArray.forEach((hallId) => {
          db.run(insertHallsQuery, [eventId, hallId], (err) => {
            if (err) {
              console.error("Error adding event halls:", err.message);
              // Rollback the transaction if there's an error
              db.run("ROLLBACK");
              return res.status(500).json({ message: "Internal server error" });
            }
          });
        });

        // Commit the transaction if everything succeeds
        db.run("COMMIT", (err) => {
          if (err) {
            console.error("Error committing transaction:", err.message);
            return res.status(500).json({ message: "Internal server error" });
          }
          res.redirect("/");
        });
      }
    );
  });
});

// READ: Get all events
router.get("/", (req, res) => {
  const query = "SELECT * FROM events";
  db.all(query, (err, rows) => {
    if (err) {
      console.error("Error fetching events:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.json(rows);
  });
});

// READ: Get a specific event by ID and render the details page
router.get("/:id", (req, res) => {
  const eventId = req.params.id;
  const eventQuery = "SELECT * FROM events WHERE id = ?";
  const hallsQuery =
    "SELECT h.name FROM halls h INNER JOIN event_halls eh ON h.id = eh.hall_id WHERE eh.event_id = ?";
  const customersQuery =
    "SELECT c.name FROM customers c INNER JOIN event_customers ec ON c.id = ec.customer_id WHERE ec.event_id = ?";
  const employeesQuery =
    "SELECT e.name FROM employees e INNER JOIN event_employees ee ON e.id = ee.employee_id WHERE ee.event_id = ?";

  // Execute all queries using Promises
  Promise.all([
    new Promise((resolve, reject) => {
      db.get(eventQuery, [eventId], (err, event) => {
        if (err) reject(err);
        resolve(event);
      });
    }),
    new Promise((resolve, reject) => {
      db.all(hallsQuery, [eventId], (err, halls) => {
        if (err) reject(err);
        resolve(halls);
      });
    }),
    new Promise((resolve, reject) => {
      db.all(customersQuery, [eventId], (err, customers) => {
        if (err) reject(err);
        resolve(customers);
      });
    }),
    new Promise((resolve, reject) => {
      db.all(employeesQuery, [eventId], (err, employees) => {
        if (err) reject(err);
        resolve(employees);
      });
    }),
  ])
    .then(([event, halls, customers, employees]) => {
      // Render the EJS file with event details and associated data
      res.render("event/event-details", { event, halls, customers, employees });
    })
    .catch((err) => {
      console.error("Error fetching event details and associated data:", err);
      res.status(500).json({ message: "Internal server error" });
    });
});

// UPDATE: Update an existing event by ID
router.post("/edit/:id", (req, res) => {
  const eventId = req.params.id;
  const {
    name,
    type,
    owner_full_name,
    owner_phone,
    address,
    start_date,
    end_date,
    halls,
    customers,
    employees,
  } = req.body;
  const query =
    "UPDATE events SET name = ?, type = ?, owner_full_name = ?, owner_phone = ?, address = ?, start_date = ?, end_date = ? WHERE id = ?";
  db.run(
    query,
    [
      name,
      type,
      owner_full_name,
      owner_phone,
      address,
      start_date,
      end_date,
      eventId,
    ],
    function (err) {
      if (err) {
        console.error("Error updating event:", err.message);
        return res.status(500).json({ message: "Internal server error" });
      }
      // Delete existing entries for halls, customers, and employees related to the event
      const deleteHallsQuery = "DELETE FROM event_halls WHERE event_id = ?";
      db.run(deleteHallsQuery, [eventId], (err) => {
        if (err) {
          console.error("Error deleting event halls:", err.message);
        }
        const deleteCustomersQuery =
          "DELETE FROM event_customers WHERE event_id = ?";
        db.run(deleteCustomersQuery, [eventId], (err) => {
          if (err) {
            console.error("Error deleting event customers:", err.message);
          }
          const deleteEmployeesQuery =
            "DELETE FROM event_employees WHERE event_id = ?";
          db.run(deleteEmployeesQuery, [eventId], (err) => {
            if (err) {
              console.error("Error deleting event employees:", err.message);
            }
            // Insert new halls for the event into the event_halls table
            if (halls && Array.isArray(halls)) {
              const insertHallsQuery =
                "INSERT INTO event_halls (event_id, hall_id) VALUES (?, ?)";
              halls.forEach((hallId) => {
                db.run(insertHallsQuery, [eventId, hallId], (err) => {
                  if (err) {
                    console.error("Error adding event halls:", err.message);
                  }
                });
              });
            }
            // Insert new customers for the event into the event_customers table
            if (customers && Array.isArray(customers)) {
              const insertCustomersQuery =
                "INSERT INTO event_customers (event_id, customer_id) VALUES (?, ?)";
              customers.forEach((customerId) => {
                db.run(insertCustomersQuery, [eventId, customerId], (err) => {
                  if (err) {
                    console.error("Error adding event customers:", err.message);
                  }
                });
              });
            }
            // Insert new employees for the event into the event_employees table
            if (employees && Array.isArray(employees)) {
              const insertEmployeesQuery =
                "INSERT INTO event_employees (event_id, employee_id) VALUES (?, ?)";
              employees.forEach((employeeId) => {
                db.run(insertEmployeesQuery, [eventId, employeeId], (err) => {
                  if (err) {
                    console.error("Error adding event employees:", err.message);
                  }
                });
              });
            }
          });
        });
      });
      res.redirect("/");
    }
  );
});

// DELETE: Delete an event by ID
router.post("/del/:id", (req, res) => {
  const eventId = req.params.id;
  const query = "DELETE FROM events WHERE id = ?";
  db.run(query, [eventId], function (err) {
    if (err) {
      console.error("Error deleting event:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
    // Also delete associated entries in the event_halls, event_customers, and event_employees tables
    const deleteHallsQuery = "DELETE FROM event_halls WHERE event_id = ?";
    db.run(deleteHallsQuery, [eventId], (err) => {
      if (err) {
        console.error("Error deleting event halls:", err.message);
      }
      const deleteCustomersQuery =
        "DELETE FROM event_customers WHERE event_id = ?";
      db.run(deleteCustomersQuery, [eventId], (err) => {
        if (err) {
          console.error("Error deleting event customers:", err.message);
        }
        const deleteEmployeesQuery =
          "DELETE FROM event_employees WHERE event_id = ?";
        db.run(deleteEmployeesQuery, [eventId], (err) => {
          if (err) {
            console.error("Error deleting event employees:", err.message);
          }
          res.redirect("/"); // No content
        });
      });
    });
  });
});

module.exports = router;
