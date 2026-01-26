// Endpoint Vercel serverless pour /api/answers/[id]/like
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
    console.log('✅ MongoDB connecté (like endpoint)');
    return true;
  } catch (err) {
    console.error('❌ Erreur connexion MongoDB (like):', err.message);
    return false;
  }
};

// Schéma Answer pour Vercel
const AnswerSchema = new mongoose.Schema({
  questionId: { type: String, required: true, index: true },
  author: { type: String, required: true },
  text: { type: String, required: true, trim: true },
  language: { type: String, default: 'fr' },
  likes: [{ type: String }], // Tableau de pseudos
  comments: [{
    author: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  collection: 'answers'
});

const Answer = mongoose.models.Answer || mongoose.model("Answer", AnswerSchema);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    console.log('=== /api/answers/[id]/like called ===', req.method);
    
    // Extraire l'ID depuis l'URL
    const urlParts = req.url.split('/');
    const answerId = urlParts[urlParts.length - 2]; // Avant /like
    
    if (!answerId) {
      return res.status(400).json({ message: 'Answer ID requis' });
    }
    
    console.log('Answer ID:', answerId);
    
    if (req.method === 'POST') {
      const { author } = req.body;
      
      if (!author) {
        return res.status(400).json({ message: 'Author requis' });
      }
      
      // Connexion à MongoDB
      const connected = await connectDB();
      if (!connected) {
        return res.status(500).json({ message: 'MongoDB non disponible' });
      }
      
      console.log('Toggling like for author:', author);
      
      const answer = await Answer.findById(answerId);
      if (!answer) {
        return res.status(404).json({ message: 'Réponse non trouvée' });
      }
      
      // Vérifier si l'utilisateur a déjà liké
      const likeIndex = answer.likes.indexOf(author);
      
      if (likeIndex > -1) {
        // Retirer le like
        answer.likes.splice(likeIndex, 1);
        console.log('Like removed');
      } else {
        // Ajouter le like
        answer.likes.push(author);
        console.log('Like added');
      }
      
      answer.updatedAt = new Date();
      await answer.save();
      
      console.log('✅ Like toggled successfully');
      return res.json({ 
        message: likeIndex > -1 ? 'Like retiré' : 'Like ajouté',
        likes: answer.likes,
        likesCount: answer.likes.length
      });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (err) {
    console.error('❌ Erreur endpoint like:', err.message);
    return res.status(500).json({ 
      message: 'Erreur serveur', 
      error: err.message 
    });
  }
}
