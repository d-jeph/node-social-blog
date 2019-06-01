const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const User = require("../models/User");
const config = require("../../config/keys");

//load input validation

const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");

/**
 * @route   GET api/users/test
 * @desc    Tests post route
 * @access  Public
 */
router.get("/test", function(req, res) {
  return res.json({ msg: "Users works" });
});

/**
 * @route   POST api/users/register
 * @desc    register user
 * @access  Public
 */
router.post("/register", function(req, res) {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(function(user) {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      let userEmail = req.body.email;
      //generate user avatar
      const avatar = gravatar.url(userEmail, {
        s: "200", //size
        r: "pg", //Rating
        d: "mm" //default
      });
      const newUser = new User({
        name: req.body.name,
        email: userEmail,
        avatar: avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

/**
 * @route   POST api/users/login
 * @desc    Login User / Returning JWT token
 * @access  Public
 */

router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;
  //find user by email
  User.findOne({ email }) //{email:email}
    .then(user => {
      //check user exists
      if (!user) {
        errors.email = "User not found";
        return res.status(404).json(errors);
      }
      //check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          //issue token :TODO
          const payload = { id: user.id, name: user.name, avatar: user.avatar }; //jwt token

          //sign token
          jwt.sign(
            payload,
            config.jwtSecretKey,
            { expiresIn: 7200 },
            (err, token) => {
              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        } else {
          errors.password = "Incorrect password";
          return res.status(404).json(errors);
        }
      });
    });
});

module.exports = router;
