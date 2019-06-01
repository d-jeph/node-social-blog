const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const passport = require("passport");

const validateProfileInput = require("../validation/profile");
//Load user model
const User = require("../models/User");
//profile model
const Profile = require("../models/Profile");

/**
 * @route   GET api/profile/test
 * @desc    Tests post route
 * @access  Private
 */
router.get("/test", function(req, res) {
  return res.json({ msg: "Profile works" });
});

/**
 * @route   GET api/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }), //protected route
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(400).json(err));
  }
);

/**
 * @route   POST api/profile
 * @desc    create or edit current user profile
 * @access  Private
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    //check for erros
    if (!isValid) {
      return res.status(400).json(errors);
    }

    //get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    //split skills into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    //social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //update profile
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { $new: true }
        ).then(profile => res.json(profile));
      } else {
        //Create

        //check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle =
              "That profile already exists, please use  a different handle";
            return res.status(400).json(errors);
          }
          //Save profile
          new Profile(profileFields).save().then(profile => {
            res.json(profile);
          });
        });
      }
    });
  }
);

module.exports = router;
