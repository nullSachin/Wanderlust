# WanderLust

WanderLust is a full-stack travel listing platform inspired by Airbnb. Users can browse stays, create and manage their own listings with photos, leave star-rated reviews, and see each property's location on an interactive map.

**Live demo:** https://YOUR-RENDER-LINK.onrender.com

## Features

- **Authentication:** sign up, log in and log out using Passport.js (local strategy). Passwords are salted and hashed with passport-local-mongoose.
- **Authorization:** only the owner of a listing can edit or delete it, and only the author of a review can delete it. Protected pages redirect to the login page and send the user back afterwards.
- **Listings (CRUD):** create, view, edit and delete listings with a title, description, price, location, country and photo.
- **Image uploads:** photos are handled by Multer and stored on Cloudinary. The image URL is saved with the listing in MongoDB.
- **Interactive maps:** the location text is converted into coordinates with the Mapbox Geocoding API and stored as a GeoJSON point. Each listing page shows a Mapbox map with a marker. The coordinates are recalculated when the location is edited.
- **Reviews and ratings:** 1 to 5 star ratings with comments, shown with the reviewer's username.
- **Flash messages:** success and error feedback after actions such as logging in or creating a listing.
- **Validation:** server-side validation with Joi for listings and reviews, plus Bootstrap form validation in the browser.
- **Error handling:** a custom `ExpressError` class, a `wrapAsync` helper for async routes, a 404 handler and a friendly error page.
- **Persistent sessions:** sessions are stored in MongoDB with connect-mongo, with a 7-day cookie.
- **UI:** responsive Bootstrap layout and a "Display total after taxes" switch that shows the +18% GST note on each listing.
- **Seed script:** fills the database with 29 sample listings, including their map coordinates.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | HTML, CSS, JavaScript, EJS, ejs-mate (layouts), Bootstrap 5, Font Awesome |
| Backend | Node.js 20, Express 4 |
| Database | MongoDB Atlas, Mongoose |
| Auth and sessions | Passport.js, passport-local, passport-local-mongoose, express-session, connect-mongo, connect-flash |
| Files and maps | Multer, Cloudinary, Mapbox (Geocoding API and Mapbox GL JS) |
| Validation | Joi |
| Other | method-override, dotenv |

## Architecture

The project follows the MVC pattern, with routes and controllers kept separate from `app.js`.

```text
Request -> Routes -> Middleware -> Controllers -> Models -> MongoDB
                                        |
                                        v
                                  Views (EJS) -> Response
```

### Project structure

```text
WanderLust/
├── controllers/
│   ├── listings.js
│   ├── reviews.js
│   └── users.js
├── init/
│   ├── data.js          # sample listings
│   └── index.js         # seed script
├── models/
│   ├── listing.js
│   ├── review.js
│   └── user.js
├── public/
│   ├── css/
│   └── js/
├── routes/
│   ├── listing.js
│   ├── review.js
│   └── user.js
├── utils/
│   ├── ExpressError.js
│   └── wrapAsync.js
├── views/
│   ├── includes/        # navbar, flash messages, footer
│   ├── layouts/         # boilerplate layout
│   ├── listings/
│   ├── users/
│   └── error.ejs
├── app.js
├── cloudConfig.js
├── middleware.js
├── schema.js            # Joi schemas
└── package.json
```

## Routes

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/` | Public | Redirects to `/listings` |
| GET | `/listings` | Public | All listings |
| GET | `/listings/new` | Logged in | New listing form |
| POST | `/listings` | Logged in | Create a listing (photo upload and geocoding) |
| GET | `/listings/:id` | Public | Listing details, reviews and map |
| GET | `/listings/:id/edit` | Owner | Edit form |
| PUT | `/listings/:id` | Owner | Update a listing (location is geocoded again) |
| DELETE | `/listings/:id` | Owner | Delete a listing |
| POST | `/listings/:id/reviews` | Logged in | Add a review |
| DELETE | `/listings/:id/reviews/:reviewId` | Review author | Delete a review |
| GET, POST | `/signup` | Public | Create an account |
| GET, POST | `/login` | Public | Log in |
| GET | `/logout` | Public | Log out |

## Getting Started

### Prerequisites

- Node.js 20
- A MongoDB Atlas cluster (or a local MongoDB)
- A Cloudinary account
- A Mapbox account and access token

### Installation

```bash
git clone https://github.com/nullSachin/Wanderlust.git
cd Wanderlust
npm install
```

### Environment variables

Create a `.env` file in the project root:

```text
ATLASDB_URL=your_mongodb_connection_string
SECRET=a_long_random_string
MAP_TOKEN=your_mapbox_access_token
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

| Variable | Purpose |
| --- | --- |
| `ATLASDB_URL` | MongoDB connection string. For a local database use `mongodb://127.0.0.1:27017/wanderlust`. |
| `SECRET` | Signs the session cookie. Use a long random string. |
| `MAP_TOKEN` | Mapbox access token for geocoding and maps. |
| `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET` | Cloudinary credentials for image uploads. |

Generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Run the app

```bash
npm start
```

Then open `http://localhost:8080`.

### Seed sample data

1. Start the app and sign up so the database has at least one user.
2. Run the seed script from the project root:

```bash
node init/index.js
```

The script uses the first user as the owner, looks up map coordinates for every sample listing, deletes the existing listings, and inserts 29 new ones. It uses the database from `ATLASDB_URL`, so check which database that points to before running it.

## Deployment (Render)

| Setting | Value |
| --- | --- |
| Build command | `npm install` |
| Start command | `npm start` |
| Node version | Read from `engines` in `package.json` (20.14.0) |

Add all the variables from the table above in Render's Environment settings, and set `NODE_ENV=production`. In MongoDB Atlas, allow Render to connect under Network Access. The server listens on `process.env.PORT`, which Render provides.

## Challenges and Fixes

- **`ERR_HTTP_HEADERS_SENT`:** a controller redirected and then kept running. Fixed by returning after `res.redirect()`.
- **`geometry.type is required`:** every listing needs a GeoJSON point. The location is geocoded before saving, and the seed script does the same for sample data.
- **Node 24 with MongoDB Atlas:** Node 24 caused `querySrv ECONNREFUSED` and TLS errors on Windows. Fixed by moving to Node 20.14.0 and pinning it in `engines`.
- **Session store errors:** connect-mongo failed to read stored sessions (`"[object Object]" is not valid JSON`), which broke every page. Fixed by removing the session encryption option and using a fresh sessions collection.
- **Flash messages appearing one page late:** with a remote session store, the browser could follow a redirect before the session was saved. Fixed by saving the session before every redirect.
- **Map not updating after an edit:** the update route did not geocode again. It now recalculates the coordinates when the location changes.
- **Secrets:** `.env` is kept out of Git, and password hashes are no longer logged.

## Known Limitations and Future Improvements

- The search bar and the category icons are visual only and are not connected to any filtering yet.
- Planned: working search and category filters, pagination, a wishlist, user profile pages and automated tests.

## Author

**Sachin Kumar**

B.Tech Computer Science and Engineering student, interested in full-stack web development.

GitHub: [nullSachin](https://github.com/nullSachin)

---

Built as a learning project to practise full-stack development with Node.js, Express and MongoDB.
