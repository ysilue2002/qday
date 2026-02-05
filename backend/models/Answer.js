const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: true,
      trim: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    reports: [
      {
        author: { type: String, required: true, trim: true },
        reason: { type: String, trim: true },
        date: { type: Date, default: Date.now }
      }
    ],
    date: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 5
    },
    likes: [
      {
        type: String,
        required: true
      }
    ],
    dislikes: [
      {
        type: String,
        required: true
      }
    ],
    reports: [
      {
        author: { type: String, required: true, trim: true },
        reason: { type: String, trim: true },
        date: { type: Date, default: Date.now }
      }
    ],
    comments: [commentSchema]
  },
  { timestamps: true }
);

// 1 seule réponse par utilisateur et par question
answerSchema.index({ questionId: 1, author: 1 }, { unique: true });

module.exports = mongoose.model("Answer", answerSchema);
