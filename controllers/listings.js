const Listing = require("../models/listing");
const User = require("../models/user.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken: mapToken});

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});

    // Listings the logged-in user has favourited
    let favouriteIds = [];
    if (req.user) {
        const user = await User.findById(req.user._id).select("favourites");
        favouriteIds = user.favourites.map((id) => id.toString());
    }

    // "Destinations for you": one card per distinct location
    const seen = new Set();
    const destinations = [];
    for (const l of allListings) {
        if (l.location && !seen.has(l.location)) {
            seen.add(l.location);
            destinations.push(l);
        }
    }

    // "Popular homes in ...": the 2 countries with the most listings
    const byCountry = {};
    for (const l of allListings) {
        if (!l.country) continue;
        (byCountry[l.country] ||= []).push(l);
    }
    const popularSections = Object.entries(byCountry)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 2)
        .map(([country, listings]) => ({ country, listings: listings.slice(0, 12) }));

    res.render("listings/index", {
        allListings,
        destinations: destinations.slice(0, 12),
        popularSections,
        favouriteIds,
    });
};

module.exports.toggleFavourite = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    const index = user.favourites.findIndex((f) => f.toString() === id);
    let favourited;
    if (index > -1) {
        user.favourites.splice(index, 1);
        favourited = false;
    } else {
        user.favourites.push(id);
        favourited = true;
    }
    await user.save();
    res.json({ favourited });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews",
         populate:{path: "author",
         },
        })
    .populate("owner");
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient
    .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    })
    .send();
    
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();

    req.flash("success", "New Listing Created!");
    return res.redirect("/listings");    
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
   if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // Find the new map position for the edited location
    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
        .send();
    if (response.body.features.length > 0) {
        listing.geometry = response.body.features[0].geometry;
    }

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }

    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};