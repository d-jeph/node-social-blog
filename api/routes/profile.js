const express = require("express");
router = express.Router();

/**
 * @route   GET api/profile/test
 * @desc    Tests post route
 * @access  Private
 */
router.get("/test", function(req, res) {
  return res.json({ msg: "Profile works" });
});

module.exports = router;
