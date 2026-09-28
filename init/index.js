if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const dbUrl = process.env.ATLASDB_URL;
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

// Finds the map coordinates for a listing (same idea as createListing)
async function getGeometry(location, country) {
  const query = location === country ? country : `${location}, ${country}`;
  const response = await geocodingClient
    .forwardGeocode({ query, limit: 1 })
    .send();
  const feature = response.body.features[0];
  return feature ? feature.geometry : null;
}

const initDB = async () => {
  await mongoose.connect(dbUrl);
  console.log(
    "Seeding database:",
    mongoose.connection.host,
    "/",
    mongoose.connection.name
  );

  // Use an existing user as the owner of the sample listings
  const owner = await User.findOne();
  if (!owner) {
    console.log(
      "No users found in this database. Sign up on the site first, then run this script again."
    );
    return;
  }

  // Build every listing first, so nothing is deleted if something fails
  const listings = [];
  for (const obj of initData.data) {
    const geometry = await getGeometry(obj.location, obj.country);
    if (!geometry) {
      console.log("Skipping (no map location found):", obj.title);
      continue;
    }
    listings.push({ ...obj, geometry, owner: owner._id });
  }

  await Listing.deleteMany({});
  await Listing.insertMany(listings);
  console.log(`${listings.length} listings added. Owner: ${owner.username}`);
};

initDB()
  .catch((err) => console.log(err))
  .finally(() => mongoose.connection.close());