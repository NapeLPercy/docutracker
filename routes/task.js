const express = require("express");
//const router = express.Router();

module.exports = (db) => {
  const router = express.Router();
  // Fixed: Use POST for assign task
  const { v4: uuidv4 } = require("uuid");

  router.post("/", (req, res) => {
    const { batchNumber, role, assignedTo, persalNumber } = req.body;

    // Validate required fields
    if (!batchNumber || !role || !assignedTo || !persalNumber) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const id = uuidv4();
    const now = new Date(); // current timestamp

    const startDate = now.toISOString().slice(0, 19).replace("T", " "); // format: YYYY-MM-DD HH:MM:SS
    const endDate = startDate; // same as startDate for now (can be adjusted later)
    const date = now.toISOString().slice(0, 10); // format: YYYY-MM-DD
    const status = "PENDING";

    const sql = `
    INSERT INTO task 
    (id, batch_number, role, assignedTo, start_time, date, persal_number, status)
    VALUES (?, ?, ?, ?, ?, ?, ?,?)
  `;

    const values = [
      id,
      batchNumber,
      role,
      assignedTo,
      startDate,
      date,
      persalNumber,
      status,
    ];

    console.log(values);
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error saving task:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      res.json({
        success: true,
        message: "Task assigned successfully",
        taskId: id,
      });
    });
  });

  // Fixed: GET user tasks
  router.get("/", (req, res) => {
    const { id, role } = req.query;
    console.log("values === ", req.query);
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

    db.query(query, [id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ success: true, tasks: results });
    });
  });

  // Start Task
  router.put("/:id/start", (req, res) => {
    const { id } = req.params; // task id
    const { status, persalNumber } = req.body; // user persalNumber

   const now = new Date();
const startDate = now.getFullYear() + '-' +
                  String(now.getMonth() + 1).padStart(2, '0') + '-' +
                  String(now.getDate()).padStart(2, '0') + ' ' +
                  String(now.getHours()).padStart(2, '0') + ':' +
                  String(now.getMinutes()).padStart(2, '0') + ':' +
                  String(now.getSeconds()).padStart(2, '0');



    // Step 1: Check if user already has an active task
    const sqlCheck = `
    SELECT t.id 
    FROM task t 
    JOIN user u ON u.persal_number = ? 
    WHERE t.persal_number = u.persal_number 
      AND t.status = 'IN_PROGRESS'
    LIMIT 1
  `;

    db.query(sqlCheck, [persalNumber], (err, results) => {
      if (err) {
        console.error("Error checking active tasks:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length > 0) {
        return res.status(400).json({
          success: false,
          message:
            "You already have a task in progress. Complete it before starting another.",
        });
      }

      // Step 2: Update task table
      const sqlTask = "UPDATE task SET status = ?, start_time = ? WHERE id = ?";
      db.query(sqlTask, [status, startDate, id], (err2) => {
        if (err2) {
          console.error("Error updating task:", err2);
          return res.status(500).json({ error: "Database error" });
        }

        // Step 3: Update user.is_active = 1
        const sqlUser = "UPDATE user SET is_active = 1 WHERE persal_number = ?";
        db.query(sqlUser, [persalNumber], (err3) => {
          if (err3) {
            console.error("Error updating user activity:", err3);
            return res.status(500).json({ error: "Database error" });
          }

          res.json({
            success: true,
            message: "Task started successfully",
            taskId: id,
            persalNumber,
            status,
          });
        });
      });
    });
  });

  // End Task
  router.put("/:id/end", (req, res) => {
    const { id } = req.params; // task id
    const { status, persalNumber } = req.body;

    const now = new Date();
    const endDate = now.toISOString().slice(0, 19).replace("T", " ");

    // 1. Update task table
    const sqlTask = "UPDATE task SET status = ?, finish_time = ? WHERE id = ?";
    db.query(sqlTask, [status, endDate, id], (err, result) => {
      if (err) {
        console.error("Error updating task:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // 2. Update user.is_active = 0
      const sqlUser = "UPDATE user SET is_active = 0 WHERE persal_number = ?";
      db.query(sqlUser, [persalNumber], (err2) => {
        if (err2) {
          console.error("Error updating user activity:", err2);
          return res.status(500).json({ error: "Database error" });
        }

        res.json({
          success: true,
          message: "Task ended successfully",
          taskId: id,
          persalNumber,
          status,
        });
      });
    });
  });

  //Report task
  router.post("/:id/report", (req, res) => {
    const { id } = req.params; //task id fk
    const { type, message, role } = req.body;
    const reportId = uuidv4();
    const now = new Date(); // current timestamp
    const date = now.toISOString().slice(0, 19).replace("T", " "); // format: YYYY-MM-DD HH:MM:SS

    console.log("This is the request object === ", req.body);
    if (!type || !message) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const query =
      "INSERT INTO report (id, type, details, role, date, task_id) VALUES (?, ?, ?,?,?,?)";

    db.query(
      query,
      [reportId, type, message, role, date, id],
      (err, result) => {
        if (err) {
          console.error("Error inserting report:", err);
          return res.status(500).json({ success: false, error: "DB error" });
        }

        res.json({ success: true, reportId: result.insertId });
      }
    );
  });

  // Dashboard route
  router.get("/dashboard", (req, res) => {
    const { id, role } = req.query;

    console.log("📊 Preparing dashboard for", id, role);

    // ---------- Worker-level stats ----------
    const sqlWorker = `
    SELECT 
      COUNT(*) AS totalTasks,
      SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedTasks,
      SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pendingTasks,
      AVG(TIMESTAMPDIFF(SECOND, start_time, finish_time)) AS avgCompletionTime
    FROM task
    WHERE persal_number = ?
  `;

    // Reports made by this worker
    // Reports linked to tasks of this worker
    const sqlWorkerReports = `
  SELECT COUNT(*) AS totalReports
  FROM report r
  INNER JOIN task t ON r.task_id = t.id
  WHERE t.persal_number = ?
`;

    // ---------- Manager-level stats ----------
    const sqlManager = `
    SELECT 
      COUNT(*) AS totalTasks,
      SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedTasks,
      SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pendingTasks,
      AVG(TIMESTAMPDIFF(SECOND, start_time, finish_time)) AS avgCompletionTime
    FROM task
  `;

    const sqlActiveMembers = `
    SELECT COUNT(*) AS activeMembers 
    FROM user 
    WHERE is_active = 1
  `;

    const sqlReportsSummary = `
    SELECT 
      SUM(CASE WHEN type = 'ERROR' THEN 1 ELSE 0 END) AS errors,
      SUM(CASE WHEN type = 'SUGGESTION' THEN 1 ELSE 0 END) AS suggestions,
      SUM(CASE WHEN type = 'OTHER' THEN 1 ELSE 0 END) AS other
    FROM report
  `;

    // Run worker-level queries first
    db.query(sqlWorker, [id], (err, workerResult) => {
      if (err) {
        console.error("❌ Error fetching worker stats:", err);
        return res
          .status(500)
          .json({ success: false, error: "Database error" });
      }

      const workerStats = workerResult[0] || {};
      workerStats.avgCompletionTime = workerStats.avgCompletionTime
        ? `${Math.floor(workerStats.avgCompletionTime / 60)}m ${
            workerStats.avgCompletionTime % 60
          }s`
        : "N/A";

      // Now get worker reports
      db.query(sqlWorkerReports, [id], (err2, reportsResult) => {
        if (err2) {
          console.error("❌ Error fetching worker reports:", err2);
          return res
            .status(500)
            .json({ success: false, error: "Database error" });
        }

        workerStats.totalReports = reportsResult[0].totalReports || 0;

        // Efficiency score = (completed / total) * 100 - (avgTime penalty)
        workerStats.efficiencyScore =
          workerStats.totalTasks > 0
            ? Math.round(
                (workerStats.completedTasks / workerStats.totalTasks) * 100
              )
            : 0;

        if (role === "MANAGER" || role === "RUNNER") {
          // Manager also needs global stats
          db.query(sqlManager, (err3, managerResult) => {
            if (err3) {
              console.error("❌ Error fetching manager stats:", err3);
              return res
                .status(500)
                .json({ success: false, error: "Database error" });
            }

            const managerStats = managerResult[0] || {};
            managerStats.avgCompletionTime = managerStats.avgCompletionTime
              ? `${Math.floor(managerStats.avgCompletionTime / 60)}m ${
                  managerStats.avgCompletionTime % 60
                }s`
              : "N/A";

            // Get active members
            db.query(sqlActiveMembers, (err4, activeResult) => {
              if (err4) {
                console.error("❌ Error fetching active members:", err4);
                return res
                  .status(500)
                  .json({ success: false, error: "Database error" });
              }

              managerStats.activeMembers = activeResult[0].activeMembers || 0;

              // Get reports summary
              db.query(sqlReportsSummary, (err5, reportsSummaryResult) => {
                if (err5) {
                  console.error("❌ Error fetching reports summary:", err5);
                  return res
                    .status(500)
                    .json({ success: false, error: "Database error" });
                }

                managerStats.reportsSummary = reportsSummaryResult[0] || {
                  errors: 0,
                  suggestions: 0,
                  other: 0,
                };

                // ✅ Return both worker + manager dashboards
                res.json({
                  success: true,
                  workerDashboard: workerStats,
                  managerDashboard: managerStats,
                });
              });
            });
          });
        } else {
          // ✅ Normal user only gets worker dashboard
          res.json({
            success: true,
            workerDashboard: workerStats,
          });
        }
      });
    });
  });

  return router;
};

//module.exports = router;

//kahbrutlrasafnzc 
