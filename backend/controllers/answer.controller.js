// controllers/answer.controller.js
const Answer = require("../models/Answer");
const mongoose = require("mongoose");

// Créer une réponse (pseudo libre)
const createAnswer = async (req, res) => {
  const { questionId, author, text } = req.body;

  if (!author || !text || !questionId) {
    return res.status(400).json({ message: "Author, questionId et texte requis" });
  }

  try {
    const answer = new Answer({
      questionId,
      author,
      text,
      likes: [],
      comments: []
    });

    await answer.save();
    res.status(201).json({ message: "Réponse créée", answer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer les réponses d’une question
const getAnswersByQuestion = async (req, res) => {
  try {
    const questionId = req.params.questionId || req.query.questionId;
    if (!questionId) {
      return res.status(400).json({ message: "questionId requis" });
    }

    // Éviter les CastError si l'ID n'est pas un ObjectId
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.json([]);
    }

    const answers = await Answer.find({ questionId })
      .sort({ createdAt: -1 });

    res.json(answers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Liker une réponse
const likeAnswer = async (req, res) => {
  const { author } = req.body;

  if (!author) return res.status(400).json({ message: "Author requis" });

  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer.likes.includes(author)) {
      answer.likes.push(author);
      await answer.save();
    }
    res.json(answer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Ajouter un commentaire
const addComment = async (req, res) => {
  const { author, text } = req.body;

  if (!author || !text) return res.status(400).json({ message: "Author et texte requis" });

  try {
    const answer = await Answer.findById(req.params.id);
    answer.comments.push({ author, text, date: new Date() });
    await answer.save();
    res.json(answer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createAnswer, getAnswersByQuestion, likeAnswer, addComment };
