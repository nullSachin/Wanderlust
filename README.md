# WanderLust 🌍

WanderLust is a full-stack travel listing web application inspired by platforms like Airbnb. It allows users to explore property listings, create and manage listings, upload images, add reviews, and view property locations on an interactive map.

## 📌 Features

- User registration and login
- User authentication and authorization
- Create new property listings
- View all available listings
- View individual listing details
- Edit and delete listings
- Upload property images
- Add and delete reviews
- Interactive maps for property locations
- Session management
- Flash messages for user feedback
- Server-side data validation
- Centralized error handling

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript
- EJS
- Bootstrap

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose
- MongoDB Atlas

### Authentication & Sessions
- Passport.js
- Express Session
- Connect-Mongo
- Connect-Flash

### Other Technologies & Services
- Multer
- Cloudinary
- Mapbox
- Joi
- Git & GitHub

## 🏗️ Project Architecture

The application follows the MVC (Model-View-Controller) architecture.

```
User
 │
 ▼
Routes
 │
 ▼
Middleware
 │
 ▼
Controllers
 │
 ├──────────────► Models ──────► MongoDB
 │
 ▼
Views (EJS)
 │
 ▼
User Interface
```

### Models
Mongoose models define and manage application data — Users, Listings, and Reviews.

### Views
EJS is used to create dynamic server-rendered pages.

### Controllers
Controllers contain the main application logic and keep route files organized.

### Routes
Express routes handle requests related to listings, reviews, and users.

## 🏠 Listing Management

WanderLust supports complete CRUD operations for property listings.

**Create** — Authorized users can create a listing with title, description, price, location, country, property image, and geographic location.

**Read** — Users can view all listings, view individual listing details, and view the property location on a map.

**Update** — Authorized users can edit their listings.

**Delete** — Authorized users can delete their listings.

## 🔐 Authentication & Authorization

Passport.js is used for user authentication, providing registration, login, logout, and session-based authentication.

Authentication identifies the user, while authorization determines whether that user has permission to perform a particular action — for example, users cannot modify or delete listings they don't own.

## ⭐ Review System

Users can add reviews to listings, containing a rating and a comment. Review operations are protected using authorization so restricted actions cannot be performed by unauthorized users.

## 🖼️ Image Upload

WanderLust supports property image uploads using Multer and Cloudinary.

```
User selects an image
        ↓
Form submission
        ↓
Multer processes the file
        ↓
Cloudinary stores the image
        ↓
Image information is associated with the listing
        ↓
Image is displayed on the listing page
```

Cloudinary is used for external image storage instead of storing image files directly inside the project.

## 🗺️ Map Integration

Mapbox is integrated to display property locations using GeoJSON-format geographic data.

```js
geometry: {
    type: "Point",
    coordinates: [longitude, latitude]
}
```

## 🗄️ Database

MongoDB is the primary database, with Mongoose providing the data modeling layer and MongoDB Atlas used for cloud hosting.

Mongoose handles schema creation, model management, database operations, validation, and relationships between application data.

## 🔑 Session Management

Express Session maintains user sessions, and Connect-Mongo stores session information in MongoDB so authenticated users stay logged in while navigating.

## 💬 Flash Messages

Connect-Flash displays temporary feedback messages, such as:
- Listing created / updated / deleted successfully
- Login successful
- Invalid request
- Listing not found
- Unauthorized action

## ✅ Data Validation

Joi validates submitted listing data on the server side before it's processed or stored.

## ❌ Error Handling

- **ExpressError** — a custom error class for application-specific errors
- **wrapAsync** — wraps async route/controller functions and forwards errors to centralized error-handling middleware, reducing repetitive try/catch blocks

## 📂 Project Structure

```
WanderLust/
│
├── controllers/
│   ├── listings.js
│   └── reviews.js
│
├── models/
│   ├── listing.js
│   ├── review.js
│   └── user.js
│
├── routes/
│   ├── listing.js
│   └── review.js
│
├── views/
│   ├── listings/
│   ├── users/
│   ├── reviews/
│   └── includes/
│
├── public/
│   ├── css/
│   └── js/
│
├── utils/
│   ├── ExpressError.js
│   └── wrapAsync.js
│
├── middleware.js
├── app.js
├── package.json
├── package-lock.json
└── README.md
```

## 🚀 How to Run the Project

**1. Clone the repository**
```
git clone <your-github-repository-url>
```

**2. Open the project**
```
cd WanderLust
```

**3. Install dependencies**
```
npm install
```

**4. Configure environment variables**

Create a `.env` file locally and add the required configuration values. Do **not** upload the `.env` file to GitHub — it should be listed in `.gitignore`.

**5. Start the application**
```
node app.js
```

Or, if an npm start script is configured:
```
npm start
```

## 🔒 Security

Sensitive information must never be committed to the repository, including:

- Database connection strings and passwords
- API keys and tokens (Cloudinary, Mapbox)
- Session secrets
- `.env` file contents

Use environment variables to store sensitive configuration:

```
DATABASE_URL=your_database_url
API_KEY=your_api_key
SECRET=your_secret
```

*(These are placeholder examples only — never commit real credentials.)*

## 🐛 Debugging & Development Experience

**ERR_HTTP_HEADERS_SENT** — occurred when a response was sent via `res.redirect()` but the function continued executing and attempted to send another response. Fixed by returning after sending the response:

```js
if (!listing) {
    return res.redirect("/listings");
}
```

**Mongoose Geometry Validation** — a `geometry.type is required` error was encountered while working with listing location data, reinforcing the importance of providing all required schema fields for GeoJSON data.

**MongoDB Session Store Error** — a session-store error-handling issue was corrected by properly receiving the error object in the callback:

```js
store.on("error", (err) => {
    console.log("ERROR IN MONGOSESSION STORE", err);
});
```

## 📚 What I Learned

- Full-stack web development with Node.js and Express.js
- MongoDB and Mongoose
- MVC architecture and RESTful routing
- Authentication and authorization
- Sessions and cookies
- File uploads and Cloudinary integration
- Mapbox integration
- Server-side validation
- Centralized error handling
- Git and GitHub
- Debugging backend applications

## 🔮 Future Improvements

- Advanced search and filtering
- Pagination
- Wishlist / favorites
- User profile pages
- Improved responsive design
- Additional listing categories
- Automated testing
- Performance optimization
- Production deployment

## 👨‍💻 Author

**Sachin Kumar**
B.Tech Computer Science & Engineering Student

Interested in: Full-Stack Web Development, JavaScript, Node.js, Express.js, MongoDB, React, C++, Data Structures & Algorithms

---

⭐ *WanderLust was built as a learning project to gain practical experience in full-stack web development and backend engineering.*
