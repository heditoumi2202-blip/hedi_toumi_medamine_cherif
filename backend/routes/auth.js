const express = require('express');
const router = express.Router();
const JsonDB = require('../utils/jsonDB');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, avatar = '' } = req.body;

    // Vérifier si l'utilisateur existe
    if (JsonDB.userExists(email, username)) {
      return res.status(400).json({ message: 'Utilisateur existe déjà' });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer nouvel utilisateur
    const user = JsonDB.createUser({
      username,
      email,
      password: hashedPassword,
      avatar,
    });

    // Créer JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = JsonDB.findUser({ email });
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Créer JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Connexion réussie',
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Suppression de compte
router.delete('/delete', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Non autorisé' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = JsonDB.read();
    db.users = (db.users || []).filter(u => u.id !== decoded.userId);
    // Remove user's photos and categories too
    db.photos = (db.photos || []).filter(p => {
      const uid = typeof p.uploadedBy === 'string' ? p.uploadedBy : (p.uploadedBy && (p.uploadedBy.id || p.uploadedBy._id));
      return uid !== decoded.userId;
    });
    db.categories = (db.categories || []).filter(c => c.createdBy !== decoded.userId);
    JsonDB.write(db);
    res.json({ message: 'Compte supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
