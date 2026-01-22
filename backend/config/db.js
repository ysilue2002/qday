const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/qday";
    await mongoose.connect(mongoUri);
    console.log("MongoDB connecté");
  } catch (err) {
    console.error("Erreur MongoDB :", err);
    process.exit(1); // quitte le serveur si connexion échoue
  }
};

module.exports = connectDB;
