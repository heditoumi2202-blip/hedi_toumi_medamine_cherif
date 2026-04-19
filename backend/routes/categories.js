const express = require('express');
const router = express.Router();
const JsonDB = require('../utils/jsonDB');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Toutes les catégories dynamiques
router.get('/', (req, res) => {
  let userId = null;
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    }
  } catch {}

  const cats = JsonDB.getCategories().filter(cat => {
    if (cat.private) return userId && cat.createdBy && cat.createdBy.id === userId;
    return true;
  });
  res.json(cats);
});

// Créer une catégorie (protégé)
router.post('/', auth, (req, res) => {
  try {
    const { name, description, coverImage } = req.body;
    if (!name) return res.status(400).json({ message: 'Le nom est requis' });
    const user = JsonDB.findUser({ id: req.user.userId });
    const category = JsonDB.createCategory({
      name,
      description,
      coverImage,
      createdBy: { id: req.user.userId, username: user ? user.username : '' }
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Supprimer une catégorie (protégé)
router.delete('/:id', auth, (req, res) => {
  try {
    const db = require('../utils/jsonDB').getCategories ? JsonDB : null;
    const cats = JsonDB.getCategories();
    const cat = cats.find(c => c.id === req.params.id);
    if (!cat) return res.status(404).json({ message: 'Catégorie non trouvée' });
    if (cat.createdBy.id !== req.user.userId)
      return res.status(403).json({ message: 'Non autorisé' });
    JsonDB.deleteCategory(req.params.id);
    res.json({ message: 'Catégorie supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
