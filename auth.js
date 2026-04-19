// Configuration API
const API_URL = 'http://localhost:5000/api';

// Gestion de l'authentification
class AuthManager {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  }

  // Vérifie si l'utilisateur est connecté
  isLoggedIn() {
    return !!this.token;
  }

  // Récupère le token
  getToken() {
    return this.token;
  }

  // Récupère l'utilisateur
  getUser() {
    return this.user;
  }

  // Inscription
  async register(username, email, password, avatar = '') {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, avatar }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      // Sauvegarder le token et l'utilisateur
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));

      return { success: true, message: 'Inscription réussie!' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Connexion
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la connexion');
      }

      // Sauvegarder le token et l'utilisateur
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));

      return { success: true, message: 'Connexion réussie!' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Suppression de compte
  async deleteAccount() {
    try {
      const response = await fetch(`${API_URL}/auth/delete`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + this.token }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur');
      this.logout();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Déconnexion
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true, message: 'Déconnecté!' };
  }
}

// Créer une instance globale
const auth = new AuthManager();
