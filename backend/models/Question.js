const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    text: {                   // anciennement title → maintenant text
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
        "Actualité"
      ]
    },
    date: {
      type: Date,
      default: Date.now
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
