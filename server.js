const express = require("express");
const mongoose = require("mongoose");

const users = require("./api/routes/users");
const posts = require("./api/routes/posts");
const profile = require("./api/routes/profile");

const app = express();

// DB Config
const dbConnectionString = require("./config/keys").mongoURI;

//connect to MongoDB
mongoose
  .connect(dbConnectionString)
  .then(() => console.log("DB Connection Successful"))
  .catch(err => console.log(err));

app.get("/", (req, res) => res.send("Hello World"));

//Use routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
