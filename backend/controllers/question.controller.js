// controllers/question.controller.js
const Question = require("../models/Question");
const mongoose = require("mongoose");

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

// Récupérer la question du jour - Version hybride (API + fallback)
const getTodayQuestion = async (req, res) => {
  try {
    console.log('=== getTodayQuestion called ===');
    console.log('MongoDB connected:', mongoose.connection.readyState === 1 ? 'YES' : 'NO');
    
    // Essayer de récupérer la question depuis MongoDB
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB connected, searching for active question...');
      const question = await Question.findOne({ active: true });
      
      if (question) {
        console.log('Found active question:', question._id);
        return res.json(question);
      }
      
      console.log('No active question found, checking for any question...');
      const anyQuestion = await Question.findOne().sort({ createdAt: -1 });
      
      if (anyQuestion) {
        console.log('Found most recent question:', anyQuestion._id);
        return res.json(anyQuestion);
      }
      
      console.log('No questions found in database');
    } else {
      console.log('MongoDB not connected, skipping database queries');
    }
    
    // Si aucune question trouvée ou MongoDB non connecté, créer une question par défaut
    const defaultQuestion = {
      _id: 'default-' + Date.now(),
      text: "Quelle est votre plus grande réussite cette année ?",
      category: "Réflexion",
      active: true,
      createdAt: new Date(),
      isDefault: true
    };
    
    console.log('Returning default question');
    res.json(defaultQuestion);
    
  } catch (err) {
    console.error('Error in getTodayQuestion:', err);
    
    // En cas d'erreur grave, retourner une question de secours
    const fallbackQuestion = {
      _id: 'fallback-' + Date.now(),
      text: "Quelle est votre plus grande réussite cette année ?",
      category: "Réflexion",
      active: true,
      createdAt: new Date(),
      isFallback: true
    };
    
    console.log('Returning fallback question due to error');
    res.json(fallbackQuestion);
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
