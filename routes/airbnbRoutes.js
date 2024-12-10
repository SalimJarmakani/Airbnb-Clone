const express = require("express");
const path = require("path");
const db = require(path.join(__dirname, "..", "db", "dbOperations"));
const router = express.Router();

// Create a new AirBnB listing
router.post("/AirBnBs", async (req, res) => {
  try {
    const newListing = await db.addNewAirBnB(req.body);
    res.status(201).json(newListing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all AirBnB listings with pagination and optional filtering by property_type
router.get("/AirBnBs", async (req, res) => {
  try {
    const { page = 1, perPage = 5, property_type } = req.query;
    const listings = await db.getAllAirBnBs(
      parseInt(page),
      parseInt(perPage),
      property_type
    );
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get AirBnB listing by ID
router.get("/AirBnBs/:id", async (req, res) => {
  try {
    const listing = await db.getAirBnBById(req.params.id);
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update AirBnB listing by ID
router.put("/AirBnBs/:id", async (req, res) => {
  try {
    const updatedListing = await db.updateAirBnBById(req.params.id, req.body);
    res.json(updatedListing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete AirBnB listing by ID
router.delete("/AirBnBs/:id", async (req, res) => {
  try {
    await db.deleteAirBnBById(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
