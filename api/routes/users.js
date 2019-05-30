const express = require("express");
router = express.Router();

/**
 * @route   GET api/users/test
 * @desc    Tests post route
 * @access  Public
 */
router.get("/test", function(req, res) {
  return res.json({ msg: "Users works" });
});

module.exports = router;
