const mongoose = require("mongoose");
const Question = require("./models/Question");

// Script pour nettoyer les questions corrompues
const cleanupQuestions = async () => {
  console.log('=== NETTOYAGE DES QUESTIONS ===');
  
  try {
    // Connexion à MongoDB Atlas (remplacez avec votre vraie URI)
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/qday";
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connecté');
    
    // Supprimer toutes les questions avec text undefined
    const result = await Question.deleteMany({ text: undefined });
    console.log(`✅ Supprimé ${result.deletedCount} questions corrompues`);
    
    // Compter les questions restantes
    const count = await Question.countDocuments();
    console.log(`✅ Il reste ${count} questions valides`);
    
    // Lister les questions restantes
    const questions = await Question.find({});
    console.log('Questions restantes:');
    questions.forEach(q => {
      console.log(`- ${q._id}: ${q.text_fr || q.text} (${q.active ? 'ACTIVE' : 'inactive'})`);
    });
    
  } catch (err) {
    console.error('❌ ERREUR:', err);
  } finally {
    await mongoose.disconnect();
  }
};

cleanupQuestions();
