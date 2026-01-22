const express = require("express");
const router = express.Router();

const {
  register,
  login
} = require("../controllers/auth.controller");

// Inscription
router.post("/register", register);

// Connexion
router.post("/login", login);

module.exports = router;
