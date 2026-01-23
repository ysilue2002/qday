const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    text: {                   // Texte principal (fallback)
      type: String,
      required: true,
      trim: true
    },
    text_fr: {                // Texte en français
      type: String,
      required: true,
      trim: true
    },
    text_en: {                // Texte en anglais
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Politique",
        "Sport",
        "Culture",
        "Santé",
        "People",
        "Religion",
        "Technologie",
        "Actualité",
        "Cuisine",
        "Cinéma",
        "Musique",
        "Voyage",
        "Réflexion",
        "Humour",
        "Science"
      ]
    },
    date: {
      type: Date,
      default: Date.now
    },
    active: {
      type: Boolean,
      default: false
    },
    scheduledDate: {           // Date programmée pour la question du jour
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
