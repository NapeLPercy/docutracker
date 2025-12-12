// models/User.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");

module.exports = {
  // Find user by persal number
  findByPersal: (persal_number) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM user WHERE persal_number = ?",
        [persal_number],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        }
      );
    });
  },

    // Find account by email
  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM account WHERE email = ?",
        [email],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        }
      );
    });
  },

  // Create user in user table
  createUser: (persal_number, surname_initials, role) => {
    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO user (persal_number, surname_initials, role, is_active)
         VALUES (?, ?, ?, 0)`,
        [persal_number, surname_initials, role],
        (err, result) => {
          if (err) return reject(err);
          resolve(result.insertId);
        }
      );
    });
  },

  // Create account with hashed password
  createAccount: (persal_number, email, hashedPassword) => {
    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO account (persal_number, email, password)
         VALUES (?, ?, ?)`,
        [persal_number, email, hashedPassword],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  },

  // Find account by email
  findAccountByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT account.*, user.role 
         FROM account 
         JOIN user ON account.persal_number = user.persal_number
         WHERE account.email = ?`,
        [email],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        }
      );
    });
  },

  //Get workers
  getWorkers: (role, isActive) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT persal_number, surname_initials 
        FROM user 
        WHERE role = ? AND is_active = ?
      `;

      db.query(sql, [role, isActive], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },


   // GET ALL USERS (except managers)
   
  getAllUsers: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT persal_number AS persal, surname_initials, role, is_active
        FROM user
        WHERE role NOT LIKE "MANAGER"
        ORDER BY surname_initials
      `;

      db.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // DELETE user (full cascade)
  deleteUser: (persal) => {
    return new Promise((resolve, reject) => {
      db.beginTransaction((err) => {
        if (err) return reject(err);

        // 1. Delete reports linked through tasks
        db.query(
          `DELETE r 
           FROM report r 
           INNER JOIN task t ON r.task_id = t.id 
           WHERE t.persal_number = ?`,
          [persal],
          (err) => {
            if (err) return db.rollback(() => reject(err));

            // 2. Delete tasks
            db.query(
              `DELETE FROM task WHERE persal_number = ?`,
              [persal],
              (err) => {
                if (err) return db.rollback(() => reject(err));

                // 3. Delete account
                db.query(
                  `DELETE FROM account WHERE persal_number = ?`,
                  [persal],
                  (err) => {
                    if (err) return db.rollback(() => reject(err));

                    // 4. Delete user
                    db.query(
                      `DELETE FROM user WHERE persal_number = ?`,
                      [persal],
                      (err, result) => {
                        if (err) return db.rollback(() => reject(err));

                        db.commit((err) => {
                          if (err) return db.rollback(() => reject(err));

                          resolve(result);
                        });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    });
  },
};
