const { body } = require("express-validator");

const validateListing = [
  body("name").notEmpty().withMessage("Name is required."),
  body("property_type").notEmpty().withMessage("Property type is required."),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0."),
  body("summary")
    .optional()
    .isString()
    .withMessage("Summary must be a string."),
  body("space")
    .optional()
    .isString()
    .withMessage("Space description must be a string."),
  body("accommodates")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Accommodates must be at least 1."),
  body("bedrooms")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Bedrooms must be a non-negative integer."),
  body("beds")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Beds must be a non-negative integer."),
  body("bathrooms")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Bathrooms must be a non-negative number."),
  body("listing_url")
    .optional()
    .isURL()
    .withMessage("Listing URL must be valid."),
  body("amenities")
    .optional()
    .isArray()
    .withMessage("Amenities must be an array."),
];

module.exports = validateListing;
