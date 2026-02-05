// controllers/answer.controller.js
const Answer = require("../models/Answer");
const mongoose = require("mongoose");

// Créer une réponse (pseudo libre)
const createAnswer = async (req, res) => {
  const { questionId, author, text } = req.body;
  const safeAuthor = typeof author === 'string' ? author.trim() : '';
  const safeText = typeof text === 'string' ? text.trim() : '';

  if (!safeAuthor || !safeText || !questionId) {
    return res.status(400).json({ message: "Author, questionId et texte requis" });
  }
  
  if (safeText.length < 2 || safeText.length > 500) {
    return res.status(400).json({ message: "Texte invalide (2-500 caractères)" });
  }
  
  if (safeAuthor.length < 2 || safeAuthor.length > 50) {
    return res.status(400).json({ message: "Auteur invalide (2-50 caractères)" });
  }

  try {
    const answer = new Answer({
      questionId,
      author: safeAuthor,
      text: safeText,
      likes: [],
      dislikes: [],
      reports: [],
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
  const safeAuthor = typeof author === 'string' ? author.trim() : '';

  if (!safeAuthor) return res.status(400).json({ message: "Author requis" });
  if (safeAuthor.length < 2 || safeAuthor.length > 50) {
    return res.status(400).json({ message: "Auteur invalide (2-50 caractères)" });
  }
  if (safeReason.length > 500) {
    return res.status(400).json({ message: "Raison trop longue (max 500 caractères)" });
  }
  if (safeAuthor.length < 2 || safeAuthor.length > 50) {
    return res.status(400).json({ message: "Auteur invalide (2-50 caractères)" });
  }

  try {
    const answer = await Answer.findById(req.params.id);
    const likeIndex = (answer.likes || []).indexOf(safeAuthor);
    if (likeIndex > -1) {
      answer.likes.splice(likeIndex, 1);
    } else {
      answer.likes.push(safeAuthor);
      answer.dislikes = (answer.dislikes || []).filter(d => d !== safeAuthor);
    }
    await answer.save();
    res.json(answer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Ajouter un commentaire
const addComment = async (req, res) => {
  const { author, text } = req.body;
  const safeAuthor = typeof author === 'string' ? author.trim() : '';
  const safeText = typeof text === 'string' ? text.trim() : '';

  if (!safeAuthor || !safeText) return res.status(400).json({ message: "Author et texte requis" });
  if (safeText.length < 2 || safeText.length > 500) {
    return res.status(400).json({ message: "Texte invalide (2-500 caractères)" });
  }
  if (safeAuthor.length < 2 || safeAuthor.length > 50) {
    return res.status(400).json({ message: "Auteur invalide (2-50 caractères)" });
  }

  try {
    const answer = await Answer.findById(req.params.id);
    answer.comments.push({ author: safeAuthor, text: safeText, date: new Date() });
    await answer.save();
    res.json(answer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Disliker une réponse
const dislikeAnswer = async (req, res) => {
  const { author } = req.body;
  const safeAuthor = typeof author === 'string' ? author.trim() : '';
  if (!safeAuthor) return res.status(400).json({ message: "Author requis" });
  if (safeAuthor.length < 2 || safeAuthor.length > 50) {
    return res.status(400).json({ message: "Auteur invalide (2-50 caractères)" });
  }
  if (safeReason.length > 500) {
    return res.status(400).json({ message: "Raison trop longue (max 500 caractères)" });
  }
  if (safeAuthor.length < 2 || safeAuthor.length > 50) {
    return res.status(400).json({ message: "Auteur invalide (2-50 caractères)" });
  }
  
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ message: "Réponse non trouvée" });
    
    const dislikeIndex = (answer.dislikes || []).indexOf(safeAuthor);
    if (dislikeIndex > -1) {
      answer.dislikes.splice(dislikeIndex, 1);
    } else {
      answer.dislikes = answer.dislikes || [];
      answer.dislikes.push(safeAuthor);
      // Enlever le like si présent
      answer.likes = (answer.likes || []).filter(like => like !== safeAuthor);
    }
    
    await answer.save();
    res.json({ dislikes: answer.dislikes, dislikesCount: answer.dislikes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Signaler une réponse
const reportAnswer = async (req, res) => {
  const { author, reason } = req.body;
  const safeAuthor = typeof author === 'string' ? author.trim() : '';
  const safeReason = typeof reason === 'string' ? reason.trim() : '';
  
  if (!safeAuthor) return res.status(400).json({ message: "Author requis" });
  
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ message: "Réponse non trouvée" });
    
    answer.reports = answer.reports || [];
    answer.reports.push({ author: safeAuthor, reason: safeReason, date: new Date() });
    await answer.save();
    
    res.json({ message: "Signalement enregistré", reportsCount: answer.reports.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Signaler un commentaire
const reportComment = async (req, res) => {
  const { author, reason, index } = req.body;
  const safeAuthor = typeof author === 'string' ? author.trim() : '';
  const safeReason = typeof reason === 'string' ? reason.trim() : '';
  
  if (!safeAuthor) return res.status(400).json({ message: "Author requis" });
  if (index === undefined || index === null) {
    return res.status(400).json({ message: "index requis" });
  }
  
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ message: "Réponse non trouvée" });
    
    if (!Array.isArray(answer.comments) || index < 0 || index >= answer.comments.length) {
      return res.status(400).json({ message: "index invalide" });
    }
    
    const comment = answer.comments[index];
    comment.reports = comment.reports || [];
    comment.reports.push({ author: safeAuthor, reason: safeReason, date: new Date() });
    await answer.save();
    
    res.json({ message: "Signalement enregistré", reportsCount: comment.reports.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Supprimer une réponse (admin)
const deleteAnswer = async (req, res) => {
  try {
    const deleted = await Answer.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Réponse non trouvée" });
    }
    return res.json({ message: "Réponse supprimée" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Supprimer un commentaire (admin)
const deleteComment = async (req, res) => {
  const { index } = req.body;
  if (index === undefined || index === null) {
    return res.status(400).json({ message: "index requis" });
  }
  
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: "Réponse non trouvée" });
    }
    
    if (!Array.isArray(answer.comments) || index < 0 || index >= answer.comments.length) {
      return res.status(400).json({ message: "index invalide" });
    }
    
    answer.comments.splice(index, 1);
    await answer.save();
    
    return res.json({ message: "Commentaire supprimé" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { createAnswer, getAnswersByQuestion, likeAnswer, dislikeAnswer, addComment, reportAnswer, reportComment, deleteAnswer, deleteComment };
