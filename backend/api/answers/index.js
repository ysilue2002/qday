// Endpoint Vercel serverless pour /api/answers
const mongoose = require("mongoose");

// Connexion MongoDB pour Vercel
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB déjà connecté (answers)');
    return true; // Déjà connecté
  }
  
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    console.log('🔗 Tentative de connexion MongoDB (answers)...');
    console.log('🔗 MONGODB_URI défini:', !!mongoUri);
    
    if (!mongoUri) {
      console.log('❌ MONGODB_URI non défini');
      return false;
    }
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // Augmenté à 10s
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000
    });
    console.log('✅ MongoDB connecté avec succès (answers)');
    return true;
  } catch (err) {
    console.error('❌ Erreur connexion MongoDB (answers):', err.message);
    console.error('❌ Stack trace:', err.stack);
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
      
      console.log('📝 POST /api/answers - Création réponse');
      console.log('📝 Question ID:', questionId);
      console.log('📝 Author:', author);
      console.log('📝 Text:', text);
      console.log('📝 Language:', language);
      
      const safeAuthor = typeof author === 'string' ? author.trim() : '';
      const safeText = typeof text === 'string' ? text.trim() : '';

      if (!questionId || !safeAuthor || !safeText) {
        console.log('❌ Champs requis manquants:', { questionId: !!questionId, author: !!author, text: !!text });
        return res.status(400).json({ 
          message: 'Champs requis manquants',
          required: ['questionId', 'author', 'text'],
          received: { questionId: !!questionId, author: !!author, text: !!text }
        });
      }
      
      if (safeText.length < 2 || safeText.length > 500) {
        return res.status(400).json({ message: 'Texte invalide (2-500 caractères)' });
      }
      
      if (safeAuthor.length < 2 || safeAuthor.length > 50) {
        return res.status(400).json({ message: 'Auteur invalide (2-50 caractères)' });
      }
      
      // Essayer de se connecter à MongoDB
      console.log('🔗 Connexion MongoDB pour création réponse...');
      const connected = await connectDB();
      
      if (connected) {
        try {
          console.log('✅ MongoDB connecté, création de la réponse...');
          
          const answer = new Answer({ 
            questionId, 
            author: safeAuthor, 
            text: safeText, 
            language: language || 'fr',
            likes: [],
            dislikes: [],
            reports: [],
            comments: []
          });
          
          await answer.save();
          console.log('✅ Réponse créée avec succès:', answer._id);
          console.log('✅ Texte sauvegardé:', answer.text);
          
          return res.status(201).json({
            message: "Réponse créée avec succès",
            answer
          });
        } catch (dbErr) {
          console.error('❌ Erreur création réponse MongoDB:', dbErr.message);
          console.error('❌ Stack trace erreur DB:', dbErr.stack);
          return res.status(500).json({ 
            message: 'Erreur base de données', 
            error: dbErr.message 
          });
        }
      } else {
        console.error('❌ MongoDB non disponible pour création réponse');
        return res.status(500).json({ 
          message: 'MongoDB non disponible - Vérifiez la configuration',
          details: 'La connexion à la base de données a échoué'
        });
      }
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (err) {
    console.error('❌ Erreur endpoint answers:', err.message);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}
