// Endpoint Vercel serverless pour /api/answers/[id]/comment-delete
const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return true;
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) return false;
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000, bufferCommands: false });
    return true;
  } catch (err) {
    console.error('❌ Erreur connexion MongoDB (comment-delete):', err.message);
    return false;
  }
};

const AnswerSchema = new mongoose.Schema({
  questionId: { type: String, required: true, index: true },
  author: { type: String, required: true },
  text: { type: String, required: true, trim: true },
  language: { type: String, default: 'fr' },
  likes: [{ type: String }],
  dislikes: [{ type: String }],
  reports: [{
    author: { type: String, required: true },
    reason: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  comments: [{
    author: { type: String, required: true },
    text: { type: String, required: true },
    reports: [{
      author: { type: String, required: true },
      reason: { type: String },
      createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'answers' });

const Answer = mongoose.models.Answer || mongoose.model("Answer", AnswerSchema);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const urlParts = req.url.split('/');
    const answerId = urlParts[urlParts.length - 2];
    const { index } = req.body || {};
    
    if (!answerId) {
      return res.status(400).json({ message: 'Answer ID requis' });
    }
    if (index === undefined || index === null) {
      return res.status(400).json({ message: 'index requis' });
    }
    
    const connected = await connectDB();
    if (!connected) {
      return res.status(500).json({ message: 'MongoDB non disponible' });
    }
    
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ message: 'Réponse non trouvée' });
    }
    
    if (!Array.isArray(answer.comments) || index < 0 || index >= answer.comments.length) {
      return res.status(400).json({ message: 'index invalide' });
    }
    
    answer.comments.splice(index, 1);
    answer.updatedAt = new Date();
    await answer.save();
    
    return res.json({ message: 'Commentaire supprimé' });
  } catch (err) {
    console.error('❌ Erreur endpoint comment-delete:', err.message);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}
