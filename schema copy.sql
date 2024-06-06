-- Define the events table
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    type TEXT,
    owner_full_name TEXT,
    owner_phone TEXT,
    address TEXT,
    start_date DATE,
    end_date DATE
);

-- Define the halls table
CREATE TABLE IF NOT EXISTS halls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    capacity INTEGER,
    price INTEGER
);

-- Define the customers table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    contact_phone TEXT,
    address TEXT
);

-- Define the employees table
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    year_of_experience INTEGER,
    age INTEGER
);

-- Define the admins table
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    user_account TEXT UNIQUE,
    password TEXT
);

-- Define the many-to-many relationship table between events and halls
CREATE TABLE IF NOT EXISTS event_halls (
    event_id INTEGER,
    hall_id INTEGER,
    FOREIGN KEY(event_id) REFERENCES events(id),
    FOREIGN KEY(hall_id) REFERENCES halls(id),
    PRIMARY KEY (event_id, hall_id)
);

-- Define the many-to-many relationship table between events and customers
CREATE TABLE IF NOT EXISTS event_customers (
    event_id INTEGER,
    customer_id INTEGER,
    FOREIGN KEY(event_id) REFERENCES events(id),
    FOREIGN KEY(customer_id) REFERENCES customers(id),
    PRIMARY KEY (event_id, customer_id)
);

-- Define the many-to-many relationship table between events and employees
CREATE TABLE IF NOT EXISTS event_employees (
    event_id INTEGER,
    employee_id INTEGER,
    FOREIGN KEY(event_id) REFERENCES events(id),
    FOREIGN KEY(employee_id) REFERENCES employees(id),
    PRIMARY KEY (event_id, employee_id)
);
