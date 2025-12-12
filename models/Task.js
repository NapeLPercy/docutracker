const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  assignTask: (taskData) => {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const now = new Date();
      const startDate = now.toISOString().slice(0, 19).replace("T", " ");
      const date = now.toISOString().slice(0, 10);
      const status = "PENDING";

      const sql = `
        INSERT INTO task 
        (id, batch_number, role, assignedTo, start_time, date, persal_number, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        id,
        taskData.batchNumber,
        taskData.role,
        taskData.assignedTo,
        startDate,
        date,
        taskData.persalNumber,
        status,
      ];

      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve({ taskId: id, result });
      });
    });
  },

  getUserTasks: (persalNumber, role) => {
    return new Promise((resolve, reject) => {
      let query = "";

      if (role === "MANAGER" || role === "RUNNER") {
        query = `
          SELECT id, assignedTo, batch_number, date, start_time, finish_time, status
          FROM task
          WHERE persal_number = ?
          ORDER BY 
            CASE status
              WHEN 'IN_PROGRESS' THEN 1
              WHEN 'PENDING' THEN 2
              WHEN 'ERROR' THEN 3
              WHEN 'APPROVED' THEN 4
              WHEN 'COMPLETED' THEN 5
              ELSE 6
            END
        `;
      } else {
        query = `
          SELECT id, batch_number, date, start_time, finish_time, status
          FROM task
          WHERE persal_number = ?
          ORDER BY 
            CASE status
              WHEN 'IN_PROGRESS' THEN 1
              WHEN 'PENDING' THEN 2
              WHEN 'ERROR' THEN 3
              WHEN 'APPROVED' THEN 4
              WHEN 'COMPLETED' THEN 5
              ELSE 6
            END
        `;
      }

      db.query(query, [persalNumber], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  startTask: (taskId, persalNumber) => {
    return new Promise((resolve, reject) => {
      const now = new Date();
      const startDate =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0") +
        " " +
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0") +
        ":" +
        String(now.getSeconds()).padStart(2, "0");

      // Check if user has active task
      const sqlCheck = `
        SELECT id 
        FROM task 
        WHERE persal_number = ? AND status = 'IN_PROGRESS'
        LIMIT 1
      `;

      db.query(sqlCheck, [persalNumber], (err, results) => {
        if (err) return reject(err);

        if (results.length > 0) {
          return reject(
            new Error(
              "You already have a task in progress. Complete it before starting another."
            )
          );
        }

        const sqlTask = "UPDATE task SET status = ?, start_time = ? WHERE id = ?";
        db.query(sqlTask, ["IN_PROGRESS", startDate, taskId], (err2) => {
          if (err2) return reject(err2);

          const sqlUser = "UPDATE user SET is_active = 1 WHERE persal_number = ?";
          db.query(sqlUser, [persalNumber], (err3) => {
            if (err3) return reject(err3);
            resolve({ taskId, persalNumber, status: "IN_PROGRESS" });
          });
        });
      });
    });
  },

  endTask: (taskId, persalNumber) => {
    return new Promise((resolve, reject) => {
      const now = new Date();
      const endDate = now.toISOString().slice(0, 19).replace("T", " ");

      const sqlTask = "UPDATE task SET status = ?, finish_time = ? WHERE id = ?";
      db.query(sqlTask, ["COMPLETED", endDate, taskId], (err) => {
        if (err) return reject(err);

        const sqlUser = "UPDATE user SET is_active = 0 WHERE persal_number = ?";
        db.query(sqlUser, [persalNumber], (err2) => {
          if (err2) return reject(err2);
          resolve({ taskId, persalNumber, status: "COMPLETED" });
        });
      });
    });
  },

  reportTask: (taskId, reportData) => {
    return new Promise((resolve, reject) => {
      const reportId = uuidv4();
      const now = new Date();
      const date = now.toISOString().slice(0, 19).replace("T", " ");

      const { type, message, role } = reportData;

      if (!type || !message) {
        return reject(new Error("Missing fields"));
      }

      const query =
        "INSERT INTO report (id, type, details, role, date, task_id) VALUES (?, ?, ?, ?, ?, ?)";

      db.query(query, [reportId, type, message, role, date, taskId], (err, result) => {
        if (err) return reject(err);
        resolve({ reportId });
      });
    });
  },
};
