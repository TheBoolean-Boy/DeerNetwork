import { generateTokenAndSetCookie } from "../lib/utils/generateTokenAndSetCookie.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {

  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ error: "Please fill in all the fields" })
    }

    const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" })
    }

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ error: "Username not available" })
    }

    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
      return res.status(400).json({ error: "Email already in use" })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be atleast 6 characters" })
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword
    })


    if (newUser) {
      await newUser.save();
      generateTokenAndSetCookie(newUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        profileImg: newUser.profileImg,
        coverImg: newUser.profileImg,
        bio: newUser.bio,
        link: newUser.link
      })
    }
    else {
      res.status(400).json({ error: "Invalid user data" })
    }
  } catch (error) {
    console.log(`Error is signup controller ${error.message}`)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const login = async (req, res) => {
  try {

    const { username, password } = req.body;
    const newUser = await User.findOne({ username });

    const isPasswordCorrect = await bcrypt.compare(password, newUser?.password || "")

    if (!newUser || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" })
    }

    generateTokenAndSetCookie(newUser._id, res);

    res.status(200).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      profileImg: newUser.profileImg,
      coverImg: newUser.profileImg,
      bio: newUser.bio,
      link: newUser.link
    })
  } catch (error) {
    console.log(`Error is login controller ${error.message}`)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt")
    res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    console.log(`Error is logout controller ${error.message}`)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getMe = async (req, res) => {
  try {
    // const user = await User.findOne(req.user._id)
    res.status(200).json(req.user)
  } catch (error) {
    console.log(`Error is logout controller ${error.message}`)
    res.status(500).json({ error: "Internal server error" })
  }
}