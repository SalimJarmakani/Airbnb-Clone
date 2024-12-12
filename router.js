const express = require("express");
const path = require("path");
const router = express.Router();
const connectDB = require(path.join(__dirname, "config", "database"));
const passport = require("passport");
const session = require("express-session");
const { validationResult } = require("express-validator");

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

const Listing = require(path.join(__dirname, "model", "Listing"));
const User = require(path.join(__dirname, "model", "User"));
const authMiddleware = require(path.join(__dirname, "middleware", "auth"));
const validateListing = require(path.join(
  __dirname,
  "middleware",
  "validation"
));
const handlebars = require("express-handlebars");

// Set the views directory
app.set("views", path.join(__dirname, "views"));
// Sets our router to use the handlebars engine
app.set("view engine", "handlebars");
// Sets handlebars configurations with absolute paths
app.engine(
  "handlebars",
  handlebars.engine({
    layoutsDir: path.join(__dirname, "views", "layouts"), // Absolute path for layouts directory
    allowProtoPropertiesByDefault: true, // Allow proto properties
    allowProtoMethodsByDefault: true, // Allow proto methods
  })
);

connectDB();
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Fetch the first 5 listings
    const listings = await Listing.find().lean().limit(5);

    res.render("index", {
      title: "Home Page",
      message: "Welcome to the Airbnb Clone!",
      listings, // Pass the listings to the Pug template
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching listings.");
  }
});

router.get("/chart", async (req, res) => {
  res.render("chart");
});

//route to view all listings viewListings
router.get("/listings", authMiddleware, async (req, res) => {
  try {
    // Fetch all listings
    const listings = await Listing.find().lean().limit(18);
    //limit number of results to improve performance

    res.render("viewListings", {
      title: "View Listings",
      listings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching listings.");
  }
});

// Route to create a new AirBnB listing
router.post("/api/AirBnBs", validateListing, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      property_type,
      price,
      summary,
      space,
      accommodates,
      bedrooms,
      beds,
      bathrooms,
      listing_url,
      amenities,
    } = req.body;

    // Create a new listing object
    const newListing = new Listing({
      name,
      property_type,
      price,
      summary,
      space,
      accommodates,
      bedrooms,
      beds,
      bathrooms,
      listing_url,
      amenities,
    });

    // Save the new listing to the database
    await newListing.save();

    // Respond with the created listing
    res.status(201).json({
      message: "Listing created successfully",
      listing: newListing,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating listing",
      error: error.message,
    });
  }
});

router.get("/api/AirBnBs/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const projection = {
      _id: 0, // exclude _id field
      Listing_url: 1,
      description: 1,
      neighborhood_overview: 1,
      cancellation_policy: 1,
      property_type: 1,
      room_type: 1,
      accommodates: 1,
      price: 1,
      images: 1,
      review_score_value: 1,
    };

    const listing = await Listing.findOne({ _id: id }, projection);

    if (!listing) {
      return res.status(404).json({ error: "AirBnB not found" });
    }

    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

router.get("/api/AirBnBs/review/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Use projection to limit returned fields
    const projection = {
      _id: 0, // exclude _id field
      reviews: 1, // include only the reviews field
      number_of_reviews: 1,
      first_review: 1,
      last_review: 1,
    };

    // Fetch the listing with reviews
    const listing = await Listing.findOne({ _id: id }, projection).populate(
      "reviews"
    );

    if (!listing) {
      return res.status(404).json({ error: "AirBnB not found" });
    }

    // Extract relevant review information
    const reviews = listing.reviews.map((review) => ({
      review_date: review.date, // Assuming a "date" field in the review object
      comment: review.comments,
      reviewerId: review.reviewer_id,
    }));

    const response = {
      number_of_reviews: listing.number_of_reviews,
      first_review: listing.first_review,
      last_review: listing.last_review,
      reviews,
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

router.put("/api/AirBnBs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      summary,
      space,
      price,
      accommodates,
      bedrooms,
      beds,
      bathrooms,
      amenities,
    } = req.body;

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      {
        name,
        summary,
        space,
        price,
        accommodates,
        bedrooms,
        beds,
        bathrooms,
        amenities,
      },
      { new: true }
    ); // Returns the updated document

    if (!updatedListing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({
      message: "Listing updated successfully",
      Listing: updatedListing,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});
router.get("/listing/add", authMiddleware, async (req, res) => {
  res.render("add");
});
// Route to update an existing listing
router.put("/listings/:id", authMiddleware, async (req, res) => {
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // to return the updated document
        runValidators: true, // Ensure validation is routerlied, need to change with express-validator later
      }
    );
    if (!updatedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.json({
      message: "Listing updated successfully",
      listing: updatedListing,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating listing", error });
  }
});

// Route to delete a listing
router.delete("/api/AirBnBs/:id", authMiddleware, async (req, res) => {
  try {
    const deletedListing = await Listing.findByIdAndDelete(req.params.id);
    if (!deletedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.json({
      message: "Listing deleted successfully",
      listing: deletedListing,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting listing", error });
  }
});

router.get("/about", (req, res) => {
  res.render("about", {
    title: "About Us",
    message: "Simple airbnb router.",
  });
});

// Register Route
router.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});

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

// Login Route
router.get("/login", (req, res) => {
  const error = req.query.error; // Get error from query string
  res.render("login", {
    title: "Login",
    error, // Pass error message to the template
  });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // Pass the error message in the query string
      return res.redirect(`/login?error=${info.message}`);
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/");
    });
  })(req, res, next);
});

// Logout Route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    res.redirect("/");
  });
});

router.get("/allListings", async (req, res) => {
  try {
    res.render("pagination", {
      title: "View Listings",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while loading the page.");
  }
});

router.get("/api/AirBnBs", async (req, res) => {
  try {
    // Set pagination parameters
    const page = parseInt(req.query.page) || 1; // Page number, default to 1
    const perPage = parseInt(req.query.perPage) || 10; // Items per page, default to 10
    const propertyType = req.query.property_type; // Optional filter by property type

    // Calculate skip value for pagination
    const skip = (page - 1) * perPage;

    // Build query object
    const query = {};
    if (propertyType) {
      query.property_type = propertyType;
    }

    console.log(query);
    // Fetch listings with pagination and optional filtering
    const listings = await Listing.find(query).skip(skip).limit(perPage).lean();

    // Get total records count (filtered if property_type is provided)
    const totalRecords = await Listing.countDocuments(query);
    const totalRecordsUnfiltered = await Listing.countDocuments(); // Total unfiltered count

    // Send the response in DataTables-compatible format
    res.json({
      draw: parseInt(req.query.draw) || 1, // Optional DataTables draw counter
      recordsTotal: totalRecordsUnfiltered, // Total records count
      recordsFiltered: totalRecords, // Total after filtering (same as totalRecords here)
      data: listings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching AirBnBs.");
  }
});

module.exports = router;
