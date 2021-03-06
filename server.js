const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./api/routes/users");
const posts = require("./api/routes/posts");
const profile = require("./api/routes/profile");

const app = express();

//Body parser middleware

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const dbConnectionString = require("./config/keys").mongoURI;

//connect to MongoDB
mongoose
  .connect(dbConnectionString, {
    useNewUrlParser: true,
    useFindAndModify: false
  })
  .then(() => console.log("DB Connection Successful"))
  .catch(err => console.log(err));

//passport middleware
app.use(passport.initialize());

//passport config
require("./config/passport")(passport);

//Use routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
