// controllers/question.controller.js
const Question = require("../models/Question");
const mongoose = require("mongoose");

// Créer une question (admin)
const createQuestion = async (req, res) => {
  const { text, text_fr, text_en, category, active } = req.body;
  try {
    if (active) {
      // désactive toutes les autres questions
      await Question.updateMany({ active: true }, { active: false });
    }
    const question = new Question({ 
      text, 
      text_fr, 
      text_en, 
      category, 
      active 
    });
    await question.save();
    res.status(201).json({ message: "Question créée", question });
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).json({ message: err.message });
  }
};

// Récupérer la question du jour - Version MongoDB sécurisée
const getTodayQuestion = async (req, res) => {
  try {
    console.log('=== getTodayQuestion called ===');
    
    // Essayer MongoDB avec protection totale
    try {
      if (mongoose.connection.readyState === 1) {
        console.log('MongoDB connected, searching for active question...');
        
        const question = await Question.findOne({ active: true });
        
        if (question && question.text) {
          console.log('Found active question:', question._id);
          return res.status(200).json(question);
        }
        
        console.log('No active question found, checking for any question...');
        const anyQuestion = await Question.findOne().sort({ createdAt: -1 });
        
        if (anyQuestion && anyQuestion.text) {
          console.log('Found most recent question:', anyQuestion._id);
          return res.status(200).json(anyQuestion);
        }
        
        console.log('No valid questions found in database');
      } else {
        console.log('MongoDB not connected');
      }
    } catch (dbErr) {
      console.error('MongoDB error (safe fallback):', dbErr.message);
    }
    
    // Aucune question active
    return res.status(404).json({ message: "Aucune question active" });
    
  } catch (err) {
    console.error('Critical error (still returning 200):', err);
    
    return res.status(500).json({ message: "Erreur serveur" });
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
