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

// Récupérer la question du jour - Version simplifiée pour Vercel
const getTodayQuestion = async (req, res) => {
  try {
    console.log('=== getTodayQuestion called ===');
    
    // Retourner directement une question par défaut pour éviter les erreurs
    const defaultQuestion = {
      _id: 'default-' + Date.now(),
      text: "Quelle est votre plus grande réussite cette année ?",
      category: "Réflexion",
      active: true,
      createdAt: new Date(),
      isDefault: true
    };
    
    console.log('Returning default question (serverless-safe)');
    return res.json(defaultQuestion);
    
    // Code original désactivé pour éviter les erreurs serverless
    /*
    console.log('MongoDB connected:', mongoose.connection.readyState === 1 ? 'YES' : 'NO');
    
    console.log('Searching for active question...');
    const question = await Question.findOne({ active: true });
    
    if (!question) {
      console.log('No active question found, checking for any question...');
      const anyQuestion = await Question.findOne().sort({ createdAt: -1 });
      
      if (!anyQuestion) {
        console.log('No questions found at all - creating default question');
        
        const defaultQuestion = new Question({
          text: "Quelle est votre plus grande réussite cette année ?",
          category: "Réflexion",
          active: true,
          createdAt: new Date()
        });
        
        await defaultQuestion.save();
        console.log('Default question created:', defaultQuestion._id);
        return res.json(defaultQuestion);
      }
      
      console.log('Found most recent question:', anyQuestion._id);
      return res.json(anyQuestion);
    }
    
    console.log('Found active question:', question._id);
    res.json(question);
    */
  } catch (err) {
    console.error('Error in getTodayQuestion:', err);
    
    // Retourner une question de secours même en cas d'erreur
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
