const db = require("../config/db");
module.exports = {
  getMetrics: (role, persal) => {
    return new Promise((resolve, reject) => {
      let wherePersal = "";

      if (role !== "MANAGER" && role !== "RUNNER") {
        wherePersal = `AND t.persal_number = ${db.escape(persal)}`;
      }

      const sql = `
        SELECT
          -- Tasks completed
          (SELECT COUNT(*) FROM task t WHERE t.status='COMPLETED'
            AND MONTH(t.finish_time)=MONTH(CURRENT_DATE())
            AND YEAR(t.finish_time)=YEAR(CURRENT_DATE()) ${wherePersal}) AS tasksCompletedCurrent,

          (SELECT COUNT(*) FROM task t WHERE t.status='COMPLETED'
            AND MONTH(t.finish_time)=MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
            AND YEAR(t.finish_time)=YEAR(CURRENT_DATE() - INTERVAL 1 MONTH) ${wherePersal}) AS tasksCompletedPrevious,

          -- Errors
          (SELECT COUNT(*) FROM report r
            JOIN task t ON r.task_id = t.id
            WHERE r.type='error'
            AND MONTH(r.date)=MONTH(CURRENT_DATE())
            AND YEAR(r.date)=YEAR(CURRENT_DATE()) ${wherePersal}) AS errorsCurrent,

          (SELECT COUNT(*) FROM report r
            JOIN task t ON r.task_id = t.id
            WHERE r.type='error'
            AND MONTH(r.date)=MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
            AND YEAR(r.date)=YEAR(CURRENT_DATE() - INTERVAL 1 MONTH) ${wherePersal}) AS errorsPrevious,

          -- Total tasks
          (SELECT COUNT(*) FROM task t
            WHERE MONTH(t.finish_time)=MONTH(CURRENT_DATE())
            AND YEAR(t.finish_time)=YEAR(CURRENT_DATE()) ${wherePersal}) AS totalTasksCurrent,

          (SELECT COUNT(*) FROM task t
            WHERE MONTH(t.finish_time)=MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
            AND YEAR(t.finish_time)=YEAR(CURRENT_DATE() - INTERVAL 1 MONTH) ${wherePersal}) AS totalTasksPrevious,

          -- Active users
          (SELECT COUNT(DISTINCT t.persal_number) FROM task t
            WHERE MONTH(t.start_time)=MONTH(CURRENT_DATE())
            AND YEAR(t.start_time)=YEAR(CURRENT_DATE())) AS activeUsersCurrent,

          (SELECT COUNT(DISTINCT t.persal_number) FROM task t
            WHERE MONTH(t.start_time)=MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
            AND YEAR(t.start_time)=YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)) AS activeUsersPrevious,

          -- Total users
          (SELECT COUNT(*) FROM user) AS totalUsers
      `;

      db.query(sql, (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
  },
};
