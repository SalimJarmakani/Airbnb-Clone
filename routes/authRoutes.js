const express = require("express");
const router = express.Router();
const path = require("path");
const passport = require("passport");
const User = require(path.join(__dirname, "..", "model", "User"));

// About page route
router.get("/about", (req, res) => {
  res.render("about", {
    title: "About Us",
    message: "Simple airbnb app.",
  });
});

// Register page route
router.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});

// Register user route
router.post("/register", async (req, res) => {
  const { username, email, password, password2 } = req.body;
  if (password !== password2) {
    return res.render("register", { error: "Passwords do not match!" });
  }

  try {
    const user = new User({ username, email, password });
    await user.save();
    res.redirect("/login");
  } catch (error) {
    res.render("register", { error: "Error registering user!" });
  }
});

// Login page route
router.get("/login", (req, res) => {
  const error = req.query.error;
  res.render("login", {
    title: "Login",
    error,
  });
});

// Login authentication route
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.redirect(`/login?error=${info.message}`);
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/");
    });
  })(req, res, next);
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    res.redirect("/");
  });
});

module.exports = router;
