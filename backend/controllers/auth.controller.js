// controllers/auth.controller.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Inscription
const register = async (req, res) => {
  const { pseudo, email } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email déjà utilisé" });

    const newUser = new User({ pseudo, email });
    await newUser.save();

    res.status(201).json({ message: "Utilisateur créé avec succès", user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Connexion
const login = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });

    // Création d’un token JWT simple
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Connexion réussie", token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login };
