require('dotenv').config(); // DOIT être en tout début

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');

// Middlewares personnalisés
const logger = require("./middlewares/logger.middleware");
const errorHandler = require("./middlewares/error.middleware");

// Connexion DB centralisée
const connectDB = require("./config/db");

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(logger); // Logger toutes les requêtes

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes API
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/questions", require("./routes/question.routes"));
app.use("/api/answers", require("./routes/answer.routes"));

// Routes pour les pages principales
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

app.get('/question', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/question.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Route catch-all pour les autres pages
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Connexion à MongoDB via config/db.js
connectDB();

// Middleware de gestion des erreurs (à placer après les routes)
app.use(errorHandler);

// PORT
const PORT = process.env.PORT || 5000;

// Pour Vercel, exporter l'app
if (process.env.NODE_ENV === 'production') {
  module.exports = app;
} else {
  const server = app.listen(PORT, () =>
    console.log(`Serveur lancé sur http://localhost:${PORT}`)
  );

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  });
}
