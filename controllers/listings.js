const Listing = require('../models/listing');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// Show all listings
// Show all listings
module.exports.index = async (req, res) => {
    let allListings;
    const category = req.query.category; // Get the category from the query string

    if (category) {
        // If a category is present, filter listings by that category
        allListings = await Listing.find({ category: category });
    } else {
        // If no category is specified, fetch all listings
        allListings = await Listing.find({});
    }
    res.render('listings/index.ejs', { allListings });
};

// Render new listing form
module.exports.renderNewForm = (req, res) => {
    res.render('listings/new.ejs');
};

// Show a specific listing
module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: 'reviews',
            populate: { path: "author" }
        })
        .populate('owner');

    if (!listing) {
        req.flash('error', 'Listing you requested does not exist!');
        return res.redirect('/listings');
    }

    res.render('listings/show.ejs', { listing, review: {} , mapToken: process.env.MAP_TOKEN });
};

// Create a new listing
module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1,
})
  .send()

    if (!req.body.listing.image) {
        req.body.listing.image = { url: "", filename: "" };
    }

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);

    req.flash('success', 'Successfully created a new listing!');
    res.redirect('/listings');
};

// Render edit form
module.exports.editListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash('error', 'Listing you requested does not exist!');
        return res.redirect('/listings');
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render('listings/edit.ejs', { listing , originalImageUrl });
};

// Update listing
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== 'undefined') {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
    }
    req.flash('success', 'Listing updated Successfully!');
    res.redirect(`/listings/${id}`);
};

// Delete listing
module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);

    req.flash('success', 'Listing Deleted!');
    res.redirect('/listings');
};
