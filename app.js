var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const session = require("express-session");

var itemRtouter = require("./routes/item");
var menuRouter = require("./routes/menu");
var dashboardRouter = require("./routes/dashboard");
const categoryRouter = require("./routes/category");
const orderRouter = require("./routes/order");
var adminRouter = require("./routes/admin");
var authRouter = require("./routes/auth");
var app = express();

const eventsRouter = require("./routes/event");
const hallsRouter = require("./routes/hall");
const db = require("./db");

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const { isAuthenticated } = require("./middleware/auth");

// Apply isAuthenticated middleware globally

app.use("/", menuRouter);
app.use("/items", itemRtouter);
app.use("/orders", orderRouter);

app.use("/admins", adminRouter);

app.use("/auth", authRouter);
app.use("/categories", categoryRouter); // Use the category router
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
