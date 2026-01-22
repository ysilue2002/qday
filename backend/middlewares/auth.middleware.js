const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// Middleware pour vérifier le token JWT
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: "Token manquant" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-__v"); // On ajoute l'utilisateur à la requête
    if (!req.user) return res.status(401).json({ message: "Utilisateur non trouvé" });
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token invalide" });
  }
};

// Middleware pour vérifier si l'utilisateur est admin
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé : Admin uniquement" });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
