const mongoose = require("mongoose");
const path = require("path");
const Listing = require(path.join(__dirname, "..", "models", "Listing"));

//Connect to MongoDB Atlas
async function initialize(connectionString) {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    throw new Error("Database connection failed");
  }
}

// Add a new AirBnB listing
async function addNewAirBnB(data) {
  try {
    const newListing = await Listing.create(data); // Using create() to add a new listing
    return newListing;
  } catch (err) {
    throw new Error("Error while adding new listing: " + err.message);
  }
}

// Get all AirBnB listings with pagination and optional filtering by property_type
async function getAllAirBnBs(page, perPage, property_type) {
  try {
    const query = property_type ? { property_type } : {};
    const listings = await Listing.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ _id: 1 }); // Sort by _id to maintain ordering
    return listings;
  } catch (err) {
    throw new Error("Error while fetching listings: " + err.message);
  }
}

// Get AirBnB listing by ID
async function getAirBnBById(id) {
  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      throw new Error("Listing not found");
    }
    return listing;
  } catch (err) {
    throw new Error("Error while fetching listing by ID: " + err.message);
  }
}

// Update AirBnB listing by ID
async function updateAirBnBById(id, data) {
  try {
    const updatedListing = await Listing.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updatedListing) {
      throw new Error("Listing not found");
    }
    return updatedListing;
  } catch (err) {
    throw new Error("Error while updating listing: " + err.message);
  }
}

// Delete AirBnB listing by ID
async function deleteAirBnBById(id) {
  try {
    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
      throw new Error("Listing not found");
    }
    return deletedListing;
  } catch (err) {
    throw new Error("Error while deleting listing: " + err.message);
  }
}

module.exports = {
  initialize,
  addNewAirBnB,
  getAllAirBnBs,
  getAirBnBById,
  updateAirBnBById,
  deleteAirBnBById,
};
