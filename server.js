require("dotenv").config(); // Loads environment variables from .env file
require("./config/database"); // database connection
const express = require("express"); // Express web server framework
const cookieParser = require("cookie-parser"); // for parsing cookies
const hpp = require("hpp"); // Prevent http param pollution
const cors = require("cors"); // Permet de faire des requêtes depuis n'importe quel domaine
const errorHandler = require("./middleware/errorMiddleware"); // Middleware qui gère les erreurs
const mongoSanitize = require("express-mongo-sanitize"); // sanitize mongoose queries
const helmet = require("helmet"); // Set security headers
const xss = require("xss-clean"); // il sécurise nos requêtes HTTP et ajoute une protection XSS mineure
//const rateLimit = require("express-rate-limit"); // Limite le nombre de requete et donc le forcing
const PORT = process.env.PORT || 6666;

const bookRoute = require("./routes/book"); // On importe les routes aux livres
const noteRoute = require("./routes/note"); // On importe les routes dédiées aux notes
const userRoutes = require("./routes/user"); // On importe la route dédiée aux utilisateurs

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 mins
//   max: 100,
// });

const app = express();

app.use(express.json()); // Body parser
app.use(cookieParser()); // Cookie parser
app.use(mongoSanitize()); // Sanitize data
//Commenté car ne permt pas d'utiliser Swagger
app.use(helmet()); // Set security headers
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent http param pollution
app.use(cors()); // Enable CORS
app.use(errorHandler);
// app.use(limiter);

// dev enviroment and production enviroment
if (process.env.NODE_ENV === "development") {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

if (process.env.NODE_ENV === "production") {
  app.use(express.errorHandler());
}

// routes
app.use("/api/books", bookRoute);
app.use("/api/notes", noteRoute);
app.use("/api/auth", userRoutes);

// server running status
app.listen(PORT, () => {
  console.log(`The app listening at http://127.0.0.1:${PORT}`.yellow.inverse);
});
// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`.red);
});

module.exports = app; // for testing
