const mongoose = require("mongoose");
const Question = require("./models/Question");

// Script de test pour vérifier la connexion MongoDB et la création de questions
const testDB = async () => {
  console.log('=== TEST DE CONNEXION MONGODB ===');
  
  try {
    // Vérifier les variables d'environnement
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'DÉFINI' : 'NON DÉFINI');
    console.log('MONGO_URI:', process.env.MONGO_URI ? 'DÉFINI' : 'NON DÉFINI');
    
    // Connexion
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/qday";
    console.log('Tentative de connexion à:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Cacher le mot de passe
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connecté avec succès!');
    
    // Test de création de question
    console.log('\n=== TEST DE CRÉATION DE QUESTION ===');
    const testQuestion = {
      text: "Question de test",
      text_fr: "Quel est votre plat préféré ?",
      text_en: "What is your favorite food?",
      category: "Cuisine",
      active: true
    };
    
    console.log('Tentative de création:', testQuestion);
    const question = new Question(testQuestion);
    await question.save();
    
    console.log('✅ Question créée avec succès!');
    console.log('ID de la question:', question._id);
    
    // Vérifier que la question existe
    const count = await Question.countDocuments();
    console.log('Nombre total de questions dans la base:', count);
    
    // Lister toutes les questions
    const questions = await Question.find({});
    console.log('Questions trouvées:', questions.map(q => ({ id: q._id, text: q.text_fr, active: q.active })));
    
  } catch (err) {
    console.error('❌ ERREUR:', err.message);
    console.error('Détails:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\nDéconnexion MongoDB');
  }
};

testDB();
