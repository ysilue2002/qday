// Endpoint Vercel serverless pour /api/answers
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
    console.log('✅ MongoDB connecté (answers)');
    return true;
  } catch (err) {
    console.error('❌ Erreur connexion MongoDB (answers):', err.message);
    return false;
  }
};

// Modèle Answer simplifié
const AnswerSchema = new mongoose.Schema({
  questionId: String,
  author: String,
  text: String,
  language: String,
  likes: [String],
  comments: [{
    author: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
}, { collection: 'answers' });

const Answer = mongoose.models.Answer || mongoose.model('Answer', AnswerSchema);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    console.log('=== /api/answers called ===', req.method);
    
    if (req.method === 'GET') {
      const { questionId } = req.query;
      
      if (!questionId) {
        return res.status(400).json({ message: 'questionId requis' });
      }
      
      // Essayer de se connecter à MongoDB
      const connected = await connectDB();
      
      if (connected) {
        try {
          const answers = await Answer.find({ questionId }).sort({ createdAt: -1 });
          console.log(`✅ ${answers.length} réponses trouvées pour ${questionId}`);
          return res.json(answers);
        } catch (dbErr) {
          console.error('❌ Erreur recherche réponses:', dbErr.message);
        }
      }
      
      // Réponses par défaut si MongoDB non disponible
      console.log('❌ MongoDB non disponible, pas de réponses');
      return res.json([]);
    }
    
    if (req.method === 'POST') {
      const { questionId, author, text, language } = req.body;
      
      if (!questionId || !author || !text) {
        return res.status(400).json({ message: 'Champs requis manquants' });
      }
      
      // Essayer de se connecter à MongoDB
      const connected = await connectDB();
      
      if (connected) {
        try {
          const answer = new Answer({ 
            questionId, 
            author, 
            text, 
            language: language || 'fr',
            likes: [],
            comments: []
          });
          await answer.save();
          
          console.log('✅ Réponse créée:', answer.text);
          return res.status(201).json(answer);
        } catch (dbErr) {
          console.error('❌ Erreur création réponse:', dbErr.message);
          return res.status(500).json({ message: dbErr.message });
        }
      }
      
      return res.status(500).json({ message: 'MongoDB non disponible' });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (err) {
    console.error('❌ Erreur endpoint answers:', err.message);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}
