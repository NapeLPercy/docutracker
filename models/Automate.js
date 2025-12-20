
import db from "../config/db.js"; // or require(..)

// IMPORTANT: promise wrapper
const dbp = db.promise();

export default {
  getBestRecordByRole: async (role) => {
    const sql = `
      SELECT 
        r.persal_number AS persal,
        r.efficiency_score AS score,
        u.role,
        u.surname_initials,
        u.is_active
      FROM record r
      INNER JOIN user u
        ON u.persal_number = r.persal_number
      WHERE u.role = ?
      ORDER BY r.efficiency_score DESC
      LIMIT 1
    `;

    const [rows] = await dbp.execute(sql, [role]);

    if (!rows.length) return null;

    const row = rows[0];

    return {
      role: row.role,
      persal: row.persal,
      score: row.score,
      surname: row.surname_initials,
      is_active: row.is_active === 1,
    };
  },

  assignTask: async ({
    id,
    batch_number,
    role,
    assignedTo,
    persal_number,
    status,
  }) => {
    const sql = `
      INSERT INTO task
      (
        id,
        batch_number,
        role,
        assignedTo,
        start_time,
        date,
        persal_number,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await dbp.execute(sql, [
      id,
      batch_number,
      role,
      assignedTo,
      null,
      null,
      persal_number,
      "PENDING",
    ]);

    return {
      id,
      batch_number,
      role,
      assignedTo,
      persal_number,
      status: status ?? "",
    };
  },
};
