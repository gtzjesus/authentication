import db from './db';

export function createUser(email, password) {
  // create new user in database
  const result = db
    .prepare('INSERT INTO users (email, password) VALUES (?,?)')
    .run(email, password);

  // return ID for user newly created
  return result.lastInsertRowid;
}

export function getUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}
