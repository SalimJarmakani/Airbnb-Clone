const express = require("express");
const path = require("path");
const router = express.Router();
const { validationResult } = require("express-validator");
const Listing = require(path.join(__dirname, "..", "model", "Listing"));
var mongoose = require("mongoose");
const authMiddleware = require(path.join(
  __dirname,
  "..",
  "middleware",
  "auth"
));
const validateListing = require(path.join(
  __dirname,
  "..",
  "middleware",
  "validation"
));

// Route to view home page with first 5 listings
router.get("/", authMiddleware, async (req, res) => {
  try {
    const listings = await Listing.find().lean().limit(5);
    res.render("index", {
      title: "Home Page",
      message: "Welcome to the Airbnb Clone!",
      listings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching listings.");
  }
});

// Route to view chart
router.get("/chart", (req, res) => {
  res.render("chart");
});

// Route to view all listings
router.get("/listings", authMiddleware, async (req, res) => {
  try {
    const listings = await Listing.find().lean().limit(18);
    res.render("viewListings", {
      title: "View Listings",
      listings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching listings.");
  }
});

// Route to add listing page
router.get("/listing/add", authMiddleware, (req, res) => {
  res.render("add");
});

// Route to get all listings with pagination
router.get("/api/AirBnBs", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const propertyType = req.query.property_type;

    const skip = (page - 1) * perPage;

    const query = {};
    if (propertyType) {
      query.property_type = propertyType;
    }

    const listings = await Listing.find(query).skip(skip).limit(perPage).lean();
    const totalRecords = await Listing.countDocuments(query);
    const totalRecordsUnfiltered = await Listing.countDocuments();

    res.json({
      draw: parseInt(req.query.draw) || 1,
      recordsTotal: totalRecordsUnfiltered,
      recordsFiltered: totalRecords,
      data: listings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching AirBnBs.");
  }
});

// Route to create a new AirBnB listing
router.post(
  "/api/AirBnBs",
  validateListing,
  authMiddleware,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = new mongoose.Types.ObjectId();

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

      const newListing = new Listing({
        _id: id,
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

      await newListing.save();

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
  }
);

// Route to get a single listing by ID
router.get("/api/AirBnBs/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const projection = {
      _id: 0,
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

// Route to get reviews for a listing
router.get("/api/AirBnBs/review/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const projection = {
      _id: 0,
      reviews: 1,
      number_of_reviews: 1,
      first_review: 1,
      last_review: 1,
    };

    const listing = await Listing.findOne({ _id: id }, projection).populate(
      "reviews"
    );

    if (!listing) {
      return res.status(404).json({ error: "AirBnB not found" });
    }

    const reviews = listing.reviews.map((review) => ({
      review_date: review.date,
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

// Route to update a listing
router.put("/api/AirBnBs/:id", authMiddleware, async (req, res) => {
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
    );

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

// Route to update a listing (alternative route)
router.put("/listings/:id", authMiddleware, async (req, res) => {
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
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

// Route for all listings page
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

router.get("/search", async (req, res) => {
  const amenitiesQuery = req.query.amenities
    ? req.query.amenities.split(",")
    : [];

  // Create an array of regex patterns for each amenity
  const regexArray = amenitiesQuery.map((amenity) => {
    return new RegExp(amenity, "i");
  });

  try {
    // Find listings that contain any of the amenities in the query using regex
    const listings = await Listing.find({
      amenities: { $elemMatch: { $in: regexArray } },
      "review_scores.review_scores_rating": { $exists: true, $ne: null },
    })
      .sort({ "review_scores.review_scores_rating": -1 }) // Sort by review_scores_rating in descending order
      .limit(15); // Limit to top 15 listings

    res.json(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ message: "Error fetching listings" });
  }
});

router.get("/showSearch", async (req, res) => {
  res.render("search");
});

module.exports = router;
