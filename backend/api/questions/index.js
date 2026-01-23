// Endpoint Vercel serverless pour /api/questions
const mongoose = require("mongoose");

// Connexion MongoDB pour Vercel
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return; // Déjà connecté
  
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.log('❌ MONGODB_URI non défini');
      return false;
    }
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false
    });
    console.log('✅ MongoDB connecté');
    return true;
  } catch (err) {
    console.error('❌ Erreur connexion MongoDB:', err.message);
    return false;
  }
};

// Modèle Question simplifié
const QuestionSchema = new mongoose.Schema({
  text: String,
  text_fr: String,
  text_en: String,
  category: String,
  active: Boolean,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'questions' });

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    console.log('=== /api/questions called ===', req.method);
    
    if (req.method === 'GET') {
      // Essayer de se connecter à MongoDB
      const connected = await connectDB();
      
      if (connected) {
        try {
          const questions = await Question.find({}).sort({ createdAt: -1 });
          console.log(`✅ ${questions.length} questions trouvées`);
          return res.json(questions);
        } catch (dbErr) {
          console.error('❌ Erreur recherche questions:', dbErr.message);
        }
      }
      
      // Questions par défaut si MongoDB non disponible
      const defaultQuestions = [
        {
          _id: 'default-1',
          text: "Quelle est votre plus grande réussite cette année ?",
          text_fr: "Quelle est votre plus grande réussite cette année ?",
          text_en: "What is your greatest achievement this year?",
          category: "Réflexion",
          active: true,
          createdAt: new Date(),
          isDefault: true
        }
      ];
      
      console.log('✅ Questions par défaut retournées');
      return res.json(defaultQuestions);
    }
    
    if (req.method === 'POST') {
      const { text, text_fr, text_en, category, active } = req.body;
      
      if (!text || !category) {
        return res.status(400).json({ message: 'Champs requis manquants' });
      }
      
      // Essayer de se connecter à MongoDB
      const connected = await connectDB();
      
      if (connected) {
        try {
          if (active) {
            await Question.updateMany({ active: true }, { active: false });
          }
          
          const question = new Question({ text, text_fr, text_en, category, active });
          await question.save();
          
          console.log('✅ Question créée:', question.text_fr);
          return res.status(201).json({ message: "Question créée", question });
        } catch (dbErr) {
          console.error('❌ Erreur création question:', dbErr.message);
          return res.status(500).json({ message: dbErr.message });
        }
      }
      
      return res.status(500).json({ message: 'MongoDB non disponible' });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (err) {
    console.error('❌ Erreur endpoint:', err.message);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}
