const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require('../models/listing.js');
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');

const listingController = require('../controllers/listings.js');
const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });

// INDEX + CREATE
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListing)
    );

// NEW
router.get('/new', isLoggedIn, listingController.renderNewForm);

 //Search
router.get('/search', async (req, res) => {
    // Get the search query from the URL
    const { q } = req.query; 

    if (!q) {
        // Handle cases where the search query is empty
        req.flash('error', 'Please enter a search destination.');
        return res.redirect('/listings');
    }

    try {
        // Create a case-insensitive regular expression for the search
        const regex = new RegExp(q, 'i'); 

        // Query the database for listings matching the search term
        const searchResults = await Listing.find({
            $or: [
                { location: { $regex: regex } },
                { title: { $regex: regex } }
            ]
        });

        if (searchResults.length === 0) {
            req.flash('error', `No listings found for "${q}".`);
        }

        // Render the listings page with the search results
        res.render('listings/index.ejs', { allListings: searchResults });

    } catch (err) {
        req.flash('error', 'An error occurred during the search.');
        res.redirect('/listings');
    }
});

// Suggestions API
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
        }).limit(5); // only send top 5 matches

        // Return only titles/locations (avoid full listing data)
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
        upload.single('listing[image]'),
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

module.exports = router;

