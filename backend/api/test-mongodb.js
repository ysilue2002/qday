// Endpoint de test pour vérifier la connexion MongoDB
const mongoose = require("mongoose");

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    console.log('=== TEST MONGODB CONNECTION ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
    
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      return res.status(500).json({
        error: 'MONGODB_URI non défini',
        env_vars: {
          MONGODB_URI: !!process.env.MONGODB_URI,
          MONGO_URI: !!process.env.MONGO_URI,
          NODE_ENV: process.env.NODE_ENV
        }
      });
    }
    
    // Masquer le mot de passe dans les logs
    const maskedUri = mongoUri.replace(/:([^@]+)@/, ':***@');
    console.log('Tentative de connexion à:', maskedUri);
    
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB déjà connecté');
      return res.json({
        status: 'connected',
        readyState: mongoose.connection.readyState,
        databases: await mongoose.connection.db.admin().listDatabases()
      });
    }
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false
    });
    
    console.log('✅ MongoDB connecté avec succès');
    
    // Lister les bases de données
    const admin = mongoose.connection.db.admin();
    const databases = await admin.listDatabases();
    
    res.json({
      status: 'connected',
      readyState: mongoose.connection.readyState,
      databases: databases.databases.map(db => db.name),
      currentDb: mongoose.connection.name
    });
    
  } catch (err) {
    console.error('❌ Erreur connexion MongoDB:', err);
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      env_vars: {
        MONGODB_URI: !!process.env.MONGODB_URI,
        MONGO_URI: !!process.env.MONGO_URI,
        NODE_ENV: process.env.NODE_ENV
      }
    });
  }
}
