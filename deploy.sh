#!/bin/bash

echo "🚀 Déploiement QDAY sur Vercel"
echo "================================"

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    echo "📦 Installation de Vercel CLI..."
    npm install -g vercel
fi

# Vérifier si git est initialisé
if [ ! -d ".git" ]; then
    echo "📦 Initialisation de Git..."
    git init
    git add .
    git commit -m "Initial commit - QDAY Application"
fi

echo "✅ Préparation terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Créez un compte sur https://vercel.com"
echo "2. Connectez-vous avec: vercel login"
echo "3. Déployez avec: vercel"
echo "4. Configurez les variables d'environnement dans le dashboard Vercel"
echo ""
echo "🔧 Variables nécessaires:"
echo "- MONGODB_URI: mongodb+srv://username:password@cluster.mongodb.net/qday"
echo "- NODE_ENV: production"
echo "- JWT_SECRET: votre-cle-secrete"
echo ""
echo "🌐 Votre site sera disponible sur: https://votre-app.vercel.app"
