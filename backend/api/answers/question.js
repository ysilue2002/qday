// Endpoint Vercel serverless pour /api/answers/question/:questionId
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
    console.log('✅ MongoDB connecté (answers/question)');
    return true;
  } catch (err) {
    console.error('❌ Erreur connexion MongoDB (answers/question):', err.message);
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
  dislikes: [String],
  reports: [{
    author: String,
    reason: String,
    createdAt: { type: Date, default: Date.now }
  }],
  comments: [{
    author: String,
    text: String,
    reports: [{
      author: String,
      reason: String,
      createdAt: { type: Date, default: Date.now }
    }],
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
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { questionId } = req.query;
    
    if (!questionId) {
      return res.status(400).json({ message: 'questionId requis' });
    }
    
    console.log('=== /api/answers/question called ===', questionId);
    
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
    
  } catch (err) {
    console.error('❌ Erreur endpoint answers/question:', err.message);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}
