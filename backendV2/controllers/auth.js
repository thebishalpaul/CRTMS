const { hashPassword, comparePassword } = require("../helpers/auth");
const User = require("../models/User");
const Institute = require("../models/Institute");
const jwt = require("jsonwebtoken");

const LoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(email);
    if (!email || !password) {
      return res
        .status(500)
        .json({ message: "Enter all the required filelds" });
    }
    
    const user = await User.findOne({ email }).populate({
      path: "institute",
      model: Institute,
    });

    // console.log("hased password: " + (await hashPassword(password)));
    if (!user) {
      return res.status(500).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(500).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({ user, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const SignupController = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(500).json({ message: "Email already registered" });
    }

    const hashedPassword = await hashPassword(password);

    const status = role === "admin" ? "verified" : "verified";

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      status,
    });
    await newUser.save();
    const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({ user: newUser, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const validationController = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(500).json({ message: "All Fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(500).json({ message: "Password doesnot match" });
    }

    const existingUser = await User.findOne({ email });
    console.log(existingUser);

    if (existingUser) {
      return res.status(500).json({ message: "Email already registered" });
    }

    res.status(200).json({ success: true, message: "Validation Successfull" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  LoginController,
  SignupController,
  validationController,
};
