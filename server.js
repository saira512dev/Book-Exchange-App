const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const passport = require("passport");
var cookieParser = require('cookie-parser')
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("express-flash");
const logger = require("morgan");
const connectDB = require("./config/database");
const mainRoutes = require("./routes/main");
const path = require("path");
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.static("frontend/build"));

require("dotenv").config({ path: "./config/.env" });

// Passport config
require("./config/passport")(passport);

connectDB();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Sessions
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    proxy: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);
app.use(cookieParser("keyboard cat"))

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use("/", mainRoutes);

if(process.env.NODE_ENV == 'production'){

  app.get('*', (req, res) => {
    app.use(express.static(path.resolve(__dirname, 'frontend', 'build')))
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  })
}

app.listen(process.env.PORT, () => {
  console.log("Server is running, you better catch it!");
});
