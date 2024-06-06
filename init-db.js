// init-db.js

const fs = require("fs");
const db = require("./db");

// Read schema.sql file
const schema = fs.readFileSync("./schema.sql", "utf8");

// Run the schema to create tables
db.exec(schema, (err) => {
  if (err) {
    console.error("Error initializing database:", err.message);
  } else {
    console.log("Database initialized successfully");
  }
});

// Close the database connection
db.close();
