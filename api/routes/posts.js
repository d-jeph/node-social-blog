const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//custom validation
const validateCommentInput = require("../validation/comment");
//Load user model
const User = require("../models/User");
//profile model
const Profile = require("../models/Profile");
//Post model
const Post = require("../models/Post");

/**
 * @route   GET api/posts/test
 * @desc    Tests post route
 * @access  Public
 */
router.get("/test", function(req, res) {
  return res.json({ msg: "Posts works" });
});

/**
 * @route   GET api/posts/
 * @desc    get all  posts
 * @access  Public
 */
router.get("/", (req, res) => {
  const errors = {};
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No posts yet" }));
});

/**
 * @route   GET api/posts/:id
 * @desc    get single post
 * @access  Public
 */
router.get("/:id", (req, res) => {
  const errors = {};
  Post.findById(req.params.id)
    .then(posts => res.json(posts))
    .catch(err =>
      res.status(404).json({ nopostfound: "No post found with that Id" })
    );
});

/**
 * @route   DELETE api/posts/:id
 * @desc    delete single post
 * @access  Private
 */
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //check for post owner
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: "User not authorized" });
          }
          //delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

/**
 * @route   DELETE api/posts/like/:id
 * @desc    like single post
 * @access  Private
 */
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res.status(404).json({ alreadyliked: "User already liked" });
          }

          //Add user id to likes array
          post.likes.unshift({ user: req.user.id });
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

/**
 * @route   DELETE api/posts/unlike/:id
 * @desc    like single post
 * @access  Private
 */
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length <= 0
          ) {
            return res
              .status(404)
              .json({ notliked: "You have not yet liked this post" });
          }
          //Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          console.log(removeIndex);
          //Splice out of array
          post.likes.splice(removeIndex, 1);

          //save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

/**
 * @route   POST api/posts/
 * @desc    Create a post
 * @access  Private
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    //check for errors
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

/**
 * @route   POST api/posts/comment/:id
 * @desc    Create a comment
 * @access  Private
 */
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateCommentInput(req.body);

    //check for errors
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id).then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      };
      //add comments array
      //Add user id to likes array
      post.comments.unshift(newComment);
      post.save().then(post => res.json(post));
    });
  }
);

/**
 * @route   DELETE api/posts/comment/:id/:comment_id
 * @desc    delete a comment from a post
 * @access  Private
 */
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.comments.filter(
              comment => comment.user.toString() === req.user.id
            ).length <= 0
          ) {
            return res
              .status(404)
              .json({ notallowed: "You can only delete your own comments " });
          }
          //Get remove index
          const removeIndex = post.comments
            .map(item => item._id.toString())
            .indexOf(req.params.comment_id);

          console.log(removeIndex);
          //Splice out of array
          post.comments.splice(removeIndex, 1);

          //save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

module.exports = router;
