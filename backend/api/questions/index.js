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
    console.log('✅ MongoDB connecté (questions)');
    return true;
  } catch (err) {
    console.error('❌ Erreur connexion MongoDB (questions):', err.message);
    return false;
  }
};

// Schéma Question pour Vercel
const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true }, // Fallback
  text_fr: { type: String, required: true, trim: true },
  text_en: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: [
      "Politique", "Sport", "Culture", "Santé", "People", "Religion",
      "Technologie", "Actualité", "Cuisine", "Cinéma", "Musique",
      "Voyage", "Réflexion", "Humour", "Science"
    ]
  },
  date: { type: Date, default: Date.now },
  active: { type: Boolean, default: false },
  scheduledDate: { type: Date }
}, { 
  timestamps: true,
  collection: 'questions'
});

const Question = mongoose.models.Question || mongoose.model("Question", QuestionSchema);

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
    
    // Connexion à MongoDB
    const connected = await connectDB();
    if (!connected) {
      return res.status(500).json({ message: 'MongoDB non disponible' });
    }
    
    if (req.method === 'GET') {
      console.log('Fetching all questions...');
      const questions = await Question.find().sort({ createdAt: -1 });
      console.log(`✅ Found ${questions.length} questions`);
      return res.json(questions);
    }
    
    if (req.method === 'POST') {
      const { text, text_fr, text_en, category, active, scheduledDate } = req.body;
      
      console.log('Creating question:', { text_fr, category, active });
      
      // Validation
      if (!text_fr || !text_en || !category) {
        return res.status(400).json({ 
          message: 'Champs requis manquants',
          required: ['text_fr', 'text_en', 'category'],
          received: { text_fr: !!text_fr, text_en: !!text_en, category: !!category }
        });
      }
      
      // Si active, désactiver les autres questions actives
      if (active) {
        await Question.updateMany({ active: true }, { active: false });
        console.log('✅ Désactivé autres questions actives');
      }
      
      const question = new Question({ 
        text: text || text_fr, // Utiliser text_fr comme fallback
        text_fr, 
        text_en, 
        category, 
        active: active || false,
        scheduledDate
      });
      
      await question.save();
      console.log('✅ Question créée:', question._id);
      
      return res.status(201).json({ 
        message: "Question créée avec succès", 
        question 
      });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (err) {
    console.error('❌ Erreur endpoint questions:', err.message);
    return res.status(500).json({ 
      message: 'Erreur serveur', 
      error: err.message 
    });
  }
}
