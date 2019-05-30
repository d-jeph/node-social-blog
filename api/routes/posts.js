const express = require("express");
router = express.Router();

/**
 * @route   GET api/posts/test
 * @desc    Tests post route
 * @access  Public
 */
router.get("/test", function(req, res) {
  return res.json({ msg: "Posts works" });
});

module.exports = router;
