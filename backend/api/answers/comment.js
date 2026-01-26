// Endpoint Vercel serverless pour /api/answers/[id]/comment
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
    console.log('✅ MongoDB connecté (comment endpoint)');
    return true;
  } catch (err) {
    console.error('❌ Erreur connexion MongoDB (comment):', err.message);
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
    console.log('=== /api/answers/[id]/comment called ===', req.method);
    
    // Extraire l'ID depuis l'URL
    const urlParts = req.url.split('/');
    const answerId = urlParts[urlParts.length - 2]; // Avant /comment
    
    if (!answerId) {
      return res.status(400).json({ message: 'Answer ID requis' });
    }
    
    console.log('Answer ID:', answerId);
    
    if (req.method === 'POST') {
      const { author, text } = req.body;
      
      if (!author || !text) {
        return res.status(400).json({ 
          message: 'Author et text requis',
          received: { author: !!author, text: !!text }
        });
      }
      
      // Connexion à MongoDB
      const connected = await connectDB();
      if (!connected) {
        return res.status(500).json({ message: 'MongoDB non disponible' });
      }
      
      console.log('Adding comment from author:', author);
      console.log('Comment text:', text);
      
      const answer = await Answer.findById(answerId);
      if (!answer) {
        return res.status(404).json({ message: 'Réponse non trouvée' });
      }
      
      // Ajouter le commentaire
      const newComment = {
        author: author,
        text: text,
        createdAt: new Date()
      };
      
      answer.comments.push(newComment);
      answer.updatedAt = new Date();
      await answer.save();
      
      console.log('✅ Comment added successfully');
      return res.json({ 
        message: 'Commentaire ajouté avec succès',
        comment: newComment,
        commentsCount: answer.comments.length
      });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (err) {
    console.error('❌ Erreur endpoint comment:', err.message);
    return res.status(500).json({ 
      message: 'Erreur serveur', 
      error: err.message 
    });
  }
}
