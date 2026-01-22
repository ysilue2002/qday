const express = require("express");
const router = express.Router();

const {
  createAnswer,
  getAnswersByQuestion,
  likeAnswer,
  addComment
} = require("../controllers/answer.controller");

// Répondre à la question
router.post("/", createAnswer);

// Récupérer réponses d'une question
router.get("/question/:questionId", getAnswersByQuestion);

// Like une réponse
router.post("/:id/like", likeAnswer);

// Commenter une réponse
router.post("/:id/comment", addComment);

module.exports = router;
