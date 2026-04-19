const express = require('express');
const router = express.Router();
const JsonDB = require('../utils/jsonDB');
const auth = require('../middleware/auth');

// Obtenir toutes les photos
router.get('/', (req, res) => {
  const db = JsonDB.read();
  const { category } = req.query;
  const photos = category
    ? db.photos.filter(p => p.category === category)
    : db.photos;
  res.json(photos);
});

// Obtenir une photo par ID
router.get('/:id', (req, res) => {
  const db = JsonDB.read();
  const photo = db.photos.find(p => p.id === req.params.id);
  if (!photo) return res.status(404).json({ message: 'Photo non trouvée' });
  res.json(photo);
});

// Ajouter une photo (protégé)
router.post('/', auth, (req, res) => {
  try {
    const { title, description, category, imageUrl } = req.body;
    const db = JsonDB.read();
    const user = JsonDB.findUser({ id: req.user.userId });
    const newPhoto = {
      id: Date.now().toString(),
      title,
      description,
      category,
      imageUrl,
      uploadedBy: { id: req.user.userId, username: user ? user.username : '' },
      likes: 0,
      createdAt: new Date().toISOString()
    };
    db.photos.push(newPhoto);
    JsonDB.write(db);
    res.status(201).json(newPhoto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Modifier une photo (protégé)
router.put('/:id', auth, (req, res) => {
  try {
    const db = JsonDB.read();
    const idx = db.photos.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Photo non trouvée' });
    if (db.photos[idx].uploadedBy.id !== req.user.userId)
      return res.status(403).json({ message: 'Non autorisé' });
    db.photos[idx] = { ...db.photos[idx], ...req.body };
    JsonDB.write(db);
    res.json(db.photos[idx]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Supprimer une photo (protégé)
router.delete('/:id', auth, (req, res) => {
  try {
    const db = JsonDB.read();
    const idx = db.photos.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Photo non trouvée' });
    if (db.photos[idx].uploadedBy.id !== req.user.userId)
      return res.status(403).json({ message: 'Non autorisé' });
    db.photos.splice(idx, 1);
    JsonDB.write(db);
    res.json({ message: 'Photo supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Liker une photo
router.post('/:id/like', (req, res) => {
  try {
    const db = JsonDB.read();
    const photo = db.photos.find(p => p.id === req.params.id);
    if (!photo) return res.status(404).json({ message: 'Photo non trouvée' });
    photo.likes = (photo.likes || 0) + 1;
    JsonDB.write(db);
    res.json(photo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
