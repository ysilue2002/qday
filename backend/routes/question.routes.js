const express = require("express");
const router = express.Router();

const {
  createQuestion,
  getTodayQuestion,
  getQuestionById,
  getAllQuestions
} = require("../controllers/question.controller");

// ADMIN
router.post("/", createQuestion);

// PUBLIC
router.get("/today", getTodayQuestion);
router.get("/", getAllQuestions);
router.get("/:id", getQuestionById);

module.exports = router;
