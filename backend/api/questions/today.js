// Endpoint Vercel serverless pour /api/questions/today
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
      serverSelectionTimeoutMS: 5000, // Timeout 5s
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
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    console.log('=== /api/questions/today called ===');
    
    // Question par défaut garantie
    const defaultQuestion = {
      _id: 'default-question-vercel',
      text: "Quelle est votre plus grande réussite cette année ?",
      text_fr: "Quelle est votre plus grande réussite cette année ?",
      text_en: "What is your greatest achievement this year?",
      category: "Réflexion / Reflection",
      active: true,
      createdAt: new Date(),
      isDefault: true
    };
    
    // Essayer de se connecter à MongoDB
    const connected = await connectDB();
    
    if (connected) {
      try {
        // Chercher question active
        const activeQuestion = await Question.findOne({ active: true });
        if (activeQuestion) {
          console.log('✅ Question active trouvée:', activeQuestion.text_fr);
          return res.json(activeQuestion);
        }
        
        // Chercher la plus récente
        const recentQuestion = await Question.findOne().sort({ createdAt: -1 });
        if (recentQuestion) {
          console.log('✅ Question récente trouvée:', recentQuestion.text_fr);
          return res.json(recentQuestion);
        }
        
        console.log('❌ Aucune question trouvée dans MongoDB');
      } catch (dbErr) {
        console.error('❌ Erreur recherche question:', dbErr.message);
      }
    } else {
      console.log('❌ MongoDB non disponible, question par défaut utilisée');
    }
    
    // Retourner la question par défaut
    console.log('✅ Question par défaut retournée');
    return res.json(defaultQuestion);
    
  } catch (err) {
    console.error('❌ Erreur endpoint:', err.message);
    
    // Question par défaut en cas d'erreur
    const fallbackQuestion = {
      _id: 'fallback-question-vercel',
      text: "Quelle est votre plus grande réussite cette année ?",
      text_fr: "Quelle est votre plus grande réussite cette année ?",
      text_en: "What is your greatest achievement this year?",
      category: "Réflexion / Reflection",
      active: true,
      createdAt: new Date(),
      isFallback: true
    };
    
    return res.json(fallbackQuestion);
  }
}
