// Endpoint SSE pour le streaming en temps réel des réponses
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
    console.log('✅ MongoDB connecté (stream)');
    return true;
  } catch (err) {
    console.error('❌ Erreur connexion MongoDB (stream):', err.message);
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
  // CORS pour SSE
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const { questionId } = req.query;
  
  if (!questionId) {
    return res.status(400).json({ message: 'questionId requis' });
  }
  
  console.log('=== SSE Stream started for question:', questionId, '===');
  
  // Headers SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Envoyer un message de connexion
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connecté au stream' })}\n\n`);
  
  let lastAnswerCount = 0;
  let checkInterval;
  
  const checkForNewAnswers = async () => {
    try {
      const connected = await connectDB();
      
      if (connected) {
        const answers = await Answer.find({ questionId }).sort({ createdAt: -1 });
        const currentCount = answers.length;
        
        // Nouvelle réponse détectée
        if (currentCount > lastAnswerCount) {
          const newAnswers = answers.slice(0, currentCount - lastAnswerCount);
          
          newAnswers.forEach(answer => {
            const message = {
              type: 'new_answer',
              answer: {
                _id: answer._id,
                pseudo: answer.author,
                text: answer.text,
                language: answer.language,
                likes: answer.likes.length,
                createdAt: answer.createdAt
              }
            };
            
            console.log('📤 Nouvelle réponse envoyée:', answer.author);
            res.write(`data: ${JSON.stringify(message)}\n\n`);
          });
          
          lastAnswerCount = currentCount;
        }
      }
    } catch (err) {
      console.error('❌ Erreur check new answers:', err.message);
    }
  };
  
  // Vérification initiale
  await checkForNewAnswers();
  
  // Vérifier toutes les 2 secondes
  checkInterval = setInterval(checkForNewAnswers, 2000);
  
  // Nettoyage quand le client se déconnecte
  req.on('close', () => {
    console.log('🔌 Client déconnecté du stream');
    if (checkInterval) {
      clearInterval(checkInterval);
    }
  });
  
  req.on('aborted', () => {
    console.log('🔌 Stream interrompu');
    if (checkInterval) {
      clearInterval(checkInterval);
    }
  });
}
