const Listing = require('../models/listing');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// 🧭 SHOW ALL LISTINGS
module.exports.index = async (req, res) => {
  const category = req.query.category;
  let allListings;

  if (category) {
    allListings = await Listing.find({ category });
  } else {
    allListings = await Listing.find({});
  }

  res.render('listings/index.ejs', { allListings });
};

// 🆕 RENDER NEW FORM
module.exports.renderNewForm = (req, res) => {
  res.render('listings/new.ejs');
};

// 🏠 SHOW A SPECIFIC LISTING
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

  res.render('listings/show.ejs', { listing, review: {}, mapToken });
};

// 🧩 CREATE NEW LISTING (MULTIPLE IMAGES)
module.exports.createListing = async (req, res, next) => {
  // Mapbox Geocoding
  const geoResponse = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1,
  }).send();

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  // ✅ Handle multiple uploads
  if (req.files && req.files.length > 0) {
    newListing.images = req.files.map(f => ({
      url: f.path,
      filename: f.filename,
    }));
  } else {
    // Fallback if no image uploaded
    newListing.images = [{ url: '/images/placeholder.jpg', filename: 'placeholder' }];
  }

  // Add Mapbox geometry
  newListing.geometry = geoResponse.body.features[0].geometry;

  await newListing.save();
  req.flash('success', 'Successfully created a new listing!');
  res.redirect(`/listings/${newListing._id}`);
};

// ✏️ RENDER EDIT FORM
module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash('error', 'Listing you requested does not exist!');
    return res.redirect('/listings');
  }

  // Fallback for old single-image listings
  let originalImageUrl = null;
if (listing.image && listing.image.url) {
  // old listings with single image
  originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250");
} else if (listing.images && listing.images.length > 0) {
  // new listings with multiple images
  originalImageUrl = listing.images[0].url.replace("/upload", "/upload/w_250");
}

res.render('listings/edit.ejs', { listing, originalImageUrl });

};

// 🔁 UPDATE LISTING (Add new images safely and update location/geometry)
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    // Find the existing listing
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Listing not found');
        return res.redirect('/listings');
    }

    // --- NEW: Re-geocode if location is present in the update ---
    if (req.body.listing.location) {
        const geoResponse = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        }).send();
        // Update geometry
        listing.geometry = geoResponse.body.features[0].geometry;
    }
    // --- END NEW ---

    // Update only the fields sent in form (including location if changed)
    listing.set(req.body.listing); 

    // If multer uploaded files, push them into images array
    if (req.files && req.files.length > 0) {
        if (!Array.isArray(listing.images)) listing.images = [];
        const newImgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
        listing.images.push(...newImgs);
    }

    // Save the listing
    await listing.save();

    req.flash('success', 'Listing updated successfully!');
    return res.redirect(`/listings/${listing._id}`);
};


// ❌ DELETE LISTING
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash('success', 'Listing deleted!');
  res.redirect('/listings');
};
