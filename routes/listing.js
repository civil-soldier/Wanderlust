const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require('../models/listing.js');
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');
const listingController = require('../controllers/listings.js');
const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });
const { cloudinary } = require('../cloudConfig.js'); // ✅ Add this line to access Cloudinary

// INDEX + CREATE
router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    // ✅ Accept up to 5 images instead of a single one
    upload.array('images', 5),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// NEW
router.get('/new', isLoggedIn, listingController.renderNewForm);

// SEARCH (no change)
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    req.flash('error', 'Please enter a search destination.');
    return res.redirect('/listings');
  }

  try {
    const regex = new RegExp(q, 'i');
    const searchResults = await Listing.find({
      $or: [
        { location: { $regex: regex } },
        { title: { $regex: regex } }
      ]
    });

    if (searchResults.length === 0) {
      req.flash('error', `No listings found for "${q}".`);
    }

    res.render('listings/index.ejs', { allListings: searchResults });
  } catch (err) {
    req.flash('error', 'An error occurred during the search.');
    res.redirect('/listings');
  }
});

// SUGGESTIONS (no change)
router.get('/suggestions', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  try {
    const regex = new RegExp(query, 'i');
    const results = await Listing.find({
      $or: [
        { location: { $regex: regex } },
        { title: { $regex: regex } }
      ]
    }).limit(5);

    const suggestions = results.map(r => r.location || r.title);
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// SHOW + UPDATE + DELETE
router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.array('images', 5),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// EDIT
router.get('/:id/edit',
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editListing)
);

// ✅ DELETE specific image from a listing
router.delete("/:id/images/:imageId", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  const { id, imageId } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // Find the image in listing.images
  const image = listing.images.find(img => img._id.toString() === imageId);
  if (image) {
    // ✅ Delete image from Cloudinary storage
    await cloudinary.uploader.destroy(image.filename);
  }

  // Remove image from MongoDB array
  listing.images = listing.images.filter(img => img._id.toString() !== imageId);
  await listing.save();

  req.flash("success", "Image deleted successfully!");
  res.redirect(`/listings/${id}/edit`);
}));

module.exports = router;
