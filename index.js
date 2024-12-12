const express = require("express");
const path = require("path");
const connectDB = require(path.join(__dirname, "config", "database"));
const passport = require("passport");
const session = require("express-session");
const handlebars = require("express-handlebars");

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Passport configuration
require(path.join(__dirname, "config", "passport"))(passport);

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Set the views directory
app.set("views", path.join(__dirname, "views"));
// Sets our app to use the handlebars engine
app.set("view engine", "handlebars");
// Sets handlebars configurations with absolute paths
app.engine(
  "handlebars",
  handlebars.engine({
    layoutsDir: path.join(__dirname, "views", "layouts"),
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  })
);

// Connect to database
connectDB();

// Import routes
const listingRoutes = require(path.join(__dirname, "routes", "listingRoutes"));
const authRoutes = require(path.join(__dirname, "routes", "authRoutes"));

// Use routes
app.use("/", listingRoutes);
app.use("/", authRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
