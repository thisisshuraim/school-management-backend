const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

module.exports = { login };