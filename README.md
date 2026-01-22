# QDAY - Application de Questions du Jour

## 🚀 Déploiement sur Vercel

### Étape 1: MongoDB Atlas
1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit (M0 Sandbox)
3. Configurez l'accès réseau: Ajoutez `0.0.0.0/0`
4. Créez un utilisateur de base de données
5. Obtenez votre connection string

### Étape 2: GitHub
1. Créez un nouveau repository: `qday`
2. Uploadez tout le code du projet
3. Structure finale:
```
qday/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── ...
├── frontend/
│   ├── index.html
│   ├── question.html
│   ├── admin.html
│   └── ...
├── vercel.json
└── README.md
```

### Étape 3: Vercel
1. Créez un compte sur [Vercel](https://vercel.com)
2. Importez le projet depuis GitHub
3. Configuration:
   - **Framework**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm install`
   - **Output Directory**: `frontend`
   - **Install Command**: `cd backend && npm install`

### Étape 4: Variables d'environnement
Dans Vercel, ajoutez ces variables:
- `MONGODB_URI`: `mongodb+srv://username:password@cluster.mongodb.net/qday`
- `NODE_ENV`: `production`
- `JWT_SECRET`: `votre-cle-secrete`

### Étape 5: Déploiement
1. Cliquez sur "Deploy"
2. Attendez le déploiement (2-3 minutes)
3. Votre site sera disponible à l'URL fournie

### Étape 6: Domaine personnalisé (optionnel)
1. Achetez un domaine (Namecheap, GoDaddy...)
2. Dans Vercel: Settings → Domains
3. Ajoutez votre domaine
4. Configurez le DNS:
   - Type: CNAME
   - Name: @
   - Value: cname.vercel-dns.com

## 🎯 URLs finales
- **Site principal**: `https://votredomaine.com`
- **Admin**: `https://votredomaine.com/admin`
- **Questions**: `https://votredomaine.com/question`

## 💡 Notes importantes
- Le site est 100% gratuit sur Vercel
- MongoDB Atlas offre 512MB gratuits
- Seul le nom de domaine est payant (~10€/an)
- Administration accessible depuis admin.html

## 🔧 Maintenance
- Les mises à jour se font automatiquement via GitHub
- Logs disponibles dans le dashboard Vercel
- Base de données gérée via MongoDB Atlas
