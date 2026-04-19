# Backend - Galerie Photo

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Créer un fichier `.env` à partir de `.env.example`:
```bash
cp .env.example .env
```

2. Modifier les variables d'environnement dans `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/galerie_photo
NODE_ENV=development
JWT_SECRET=votre_clé_secrète_ici
CORS_ORIGIN=http://localhost:3000
```

## Démarrage

### Mode développement (avec auto-reload)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter

### Photos
- `GET /api/photos` - Obtenir toutes les photos
- `GET /api/photos?category=nature` - Filtrer par catégorie
- `GET /api/photos/:id` - Obtenir une photo spécifique
- `POST /api/photos` - Ajouter une photo (authentifié)
- `PUT /api/photos/:id` - Modifier une photo (authentifié)
- `DELETE /api/photos/:id` - Supprimer une photo (authentifié)
- `POST /api/photos/:id/like` - Liker une photo

### Santé
- `GET /api/health` - Vérifier l'état du serveur

## Prérequis

- Node.js v14+
- MongoDB en local ou Atlas
- npm ou yarn

## Structure

```
backend/
├── config/         # Configuration (DB)
├── middleware/     # Middlewares (Auth)
├── models/         # Modèles Mongoose (User, Photo)
├── routes/         # Routes API (auth, photos)
├── server.js       # Point d'entrée
├── package.json    # Dépendances
└── .env            # Variables d'environnement
```
