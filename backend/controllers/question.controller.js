// controllers/question.controller.js
const Question = require("../models/Question");

// Créer une question (admin)
const createQuestion = async (req, res) => {
  const { text, category, active } = req.body;
  try {
    if (active) {
      // désactive toutes les autres questions
      await Question.updateMany({ active: true }, { active: false });
    }
    const question = new Question({ text, category, active });
    await question.save();
    res.status(201).json({ message: "Question créée", question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer la question du jour
const getTodayQuestion = async (req, res) => {
  try {
    console.log('Searching for active question...');
    const question = await Question.findOne({ active: true });
    
    if (!question) {
      console.log('No active question found, checking for any question...');
      // Si aucune question active, prendre la plus récente
      const anyQuestion = await Question.findOne().sort({ createdAt: -1 });
      
      if (!anyQuestion) {
        console.log('No questions found at all');
        return res.status(404).json({ message: "Aucune question trouvée" });
      }
      
      console.log('Found most recent question:', anyQuestion._id);
      return res.json(anyQuestion);
    }
    
    console.log('Found active question:', question._id);
    res.json(question);
  } catch (err) {
    console.error('Error in getTodayQuestion:', err);
    res.status(500).json({ message: err.message });
  }
};

// Récupérer question par ID
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question non trouvée" });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer toutes les questions
const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ date: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createQuestion, getTodayQuestion, getQuestionById, getAllQuestions };
