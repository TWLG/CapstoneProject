const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth");

router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "You have access", user: req.user });
});

module.exports = router;
8