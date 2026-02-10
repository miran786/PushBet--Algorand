const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    process.env.JWT_SECRET || "secret_key",
    { expiresIn: "30d" }
  );
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    const token = generateToken(newUser);

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.status(200).json({ success: true, user, token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.linkWallet = async (req, res) => {
  const { walletAddress } = req.body;
  const userId = req.user.id; // From middleware

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.walletAddress = walletAddress;
    await user.save();

    res.status(200).json({ success: true, message: "Wallet linked successfully", user });
  } catch (error) {
    console.error("Error linking wallet:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").populate("pastGames");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
exports.getUserByEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email }).select("-password").populate("pastGames");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.getLeaderboard = async (req, res) => {
  try {
    // Fetch users sorted by funds (descending)
    // Limit to top 50 users
    const users = await User.find({})
      .select("username funds gamesPlayed winnings")
      .sort({ funds: -1 })
      .limit(50);

    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};
