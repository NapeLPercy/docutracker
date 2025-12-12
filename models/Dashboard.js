const db = require("../config/db");

module.exports = {
  getWorkerStats(id) {
    const sql = `
      SELECT 
        COUNT(*) AS totalTasks,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedTasks,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pendingTasks,
        AVG(TIMESTAMPDIFF(SECOND, start_time, finish_time)) AS avgCompletionTime
      FROM task
      WHERE persal_number = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },

  getWorkerReportCount(id) {
    const sql = `
      SELECT COUNT(*) AS totalReports
      FROM report r
      INNER JOIN task t ON r.task_id = t.id
      WHERE t.persal_number = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },

  getManagerStats() {
    const sql = `
      SELECT 
        COUNT(*) AS totalTasks,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedTasks,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pendingTasks,
        AVG(TIMESTAMPDIFF(SECOND, start_time, finish_time)) AS avgCompletionTime
      FROM task
    `;
    return this._query(sql);
  },

  getActiveMembers() {
    const sql = `SELECT COUNT(*) AS activeMembers FROM user WHERE is_active = 1`;
    return this._query(sql);
  },

  getReportsSummary() {
    const sql = `
      SELECT 
        SUM(CASE WHEN type = 'ERROR' THEN 1 ELSE 0 END) AS errors,
        SUM(CASE WHEN type = 'SUGGESTION' THEN 1 ELSE 0 END) AS suggestions,
        SUM(CASE WHEN type = 'OTHER' THEN 1 ELSE 0 END) AS other
      FROM report
    `;
    return this._query(sql);
  },

  _query(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }
};
