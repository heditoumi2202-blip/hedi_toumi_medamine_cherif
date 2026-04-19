const express = require('express');
const router = express.Router();
const JsonDB = require('../utils/jsonDB');

// Retourne la liste des photographes (sans mots de passe)
router.get('/', (req, res) => {
  const db = JsonDB.read();
  const photos = db.photos || [];
  const users = (db.users || []).map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    avatar: u.avatar || '',
    photoCount: photos.filter(p => {
      const uid = typeof p.uploadedBy === 'string' ? p.uploadedBy : (p.uploadedBy && (p.uploadedBy.id || p.uploadedBy._id));
      return uid === u.id;
    }).length,
    createdAt: u.createdAt
  }));
  res.json(users);
});

module.exports = router;
