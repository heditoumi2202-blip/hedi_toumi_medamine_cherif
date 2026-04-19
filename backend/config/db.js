const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../data.json');

// Initialiser la base de données JSON
const initDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], photos: [] }, null, 2));
  }
};

const connectDB = async () => {
  try {
    initDB();
    console.log(`✅ Base de données JSON connectée: ${DB_FILE}`);
  } catch (error) {
    console.error(`Erreur: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
