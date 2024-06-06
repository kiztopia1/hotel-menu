CREATE TABLE Admin (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE Categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE Items (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  img_url TEXT,
  price REAL NOT NULL CHECK (price >= 0),
  cook_time TEXT,
  category_id INTEGER,
  FOREIGN KEY (category_id) REFERENCES Categories(id)
);

CREATE TABLE Orders (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL,
  total_price REAL NOT NULL CHECK (total_price >= 0),
  order_date TEXT DEFAULT (datetime('now'))
);

CREATE TABLE Order_Items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price REAL NOT NULL CHECK (price >= 0),
  FOREIGN KEY (order_id) REFERENCES Orders(id),
  FOREIGN KEY (item_id) REFERENCES Items(id)
);
