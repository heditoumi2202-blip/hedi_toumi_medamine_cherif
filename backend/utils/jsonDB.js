const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../data.json');

class JsonDB {
  static read() {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    } catch {
      return { users: [], photos: [] };
    }
  }

  static write(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  }

  static findUser(query) {
    const db = this.read();
    if (query.email) {
      return db.users.find(u => u.email === query.email);
    }
    if (query.username) {
      return db.users.find(u => u.username === query.username);
    }
    if (query.id) {
      return db.users.find(u => u.id === query.id);
    }
    return null;
  }

  static createUser(userData) {
    const db = this.read();
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    this.write(db);
    return newUser;
  }

  static userExists(email, username) {
    const db = this.read();
    return db.users.some(u => u.email === email || u.username === username);
  }

  static getCategories() {
    const db = this.read();
    return db.categories || [];
  }

  static createCategory(data) {
    const db = this.read();
    if (!db.categories) db.categories = [];
    const slug = data.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const category = {
      id: Date.now().toString(),
      slug,
      name: data.name,
      description: data.description || '',
      coverImage: data.coverImage || '',
      createdBy: data.createdBy,
      createdAt: new Date().toISOString()
    };
    db.categories.push(category);
    this.write(db);
    return category;
  }

  static deleteCategory(id) {
    const db = this.read();
    if (!db.categories) return false;
    const idx = db.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;
    db.categories.splice(idx, 1);
    this.write(db);
    return true;
  }
}

module.exports = JsonDB;
