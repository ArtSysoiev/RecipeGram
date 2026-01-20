import * as SQLite from 'expo-sqlite'; // TypeError: undefined is not a function

const db = SQLite.openDatabaseSync('recipegram.db')

export async function initDatabase() {
  try {
    await db.execAsync('PRAGMA foreign_keys = ON;')

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        profile_image TEXT -- path?
      );

      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        time TEXT NOT NULL, --time to cook, but its late to change, F
        author_id INTEGER NOT NULL,
        image_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        amount TEXT NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        name TEXT,
        description TEXT NOT NULL,
        step_order INTEGER NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS step_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        step_id INTEGER NOT NULL,
        image_path TEXT NOT NULL,
        caption TEXT,
        FOREIGN KEY (step_id) REFERENCES steps (id) ON DELETE CASCADE
      );
    `)

    console.log('Db init ok')
  } catch (error) {
    console.error('Db init error:', error)
  }
};

export default db;