const express = require("express");
const router = express.Router();

const {
  createAnswer,
  getAnswersByQuestion,
  likeAnswer,
  dislikeAnswer,
  addComment,
  reportAnswer,
  reportComment,
  deleteAnswer,
  deleteComment
} = require("../controllers/answer.controller");

// Répondre à la question
router.post("/", createAnswer);

// Récupérer réponses d'une question (query ou param)
router.get("/question", getAnswersByQuestion);
router.get("/question/:questionId", getAnswersByQuestion);

// Like une réponse
router.post("/:id/like", likeAnswer);

// Dislike une réponse
router.post("/:id/dislike", dislikeAnswer);

// Commenter une réponse
router.post("/:id/comment", addComment);

// Signaler une réponse
router.post("/:id/report", reportAnswer);

// Signaler un commentaire
router.post("/:id/comment-report", reportComment);

// Supprimer une réponse
router.delete("/:id", deleteAnswer);

// Supprimer un commentaire
router.post("/:id/comment-delete", deleteComment);

module.exports = router;
