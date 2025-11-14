// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");
const OpenAI = require("openai");
require("dotenv").config();
// Import routes
const taskRoutes = require("./routes/task")(db);
//const reportRoutes = require('./routes/report');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Use routes with a prefix
app.use("/task", taskRoutes);
//app.use(reportRoutes);

// Fixed: Use POST for login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  console.log("About to query with:", email, password);

  db.query(
    `SELECT account.email, user.role, user.persal_number
   FROM account
   JOIN user ON account.persal_number = user.persal_number
   WHERE account.email = ? AND account.password = ?`,
    [email, password],
    (err, results) => {
      if (err) {
        console.error("Error during login:", err);
        return res
          .status(500)
          .json({ success: false, error: "Database error" });
      }

      if (results.length > 0) {
        const user = results[0];
        res.json({
          success: true,
          message: "Login successful",
          user: {
            email: user.email,
            role: user.role,
            persalNumber: user.persal_number,
          },
        });
      } else {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }
    }
  );
});

//Add users to the system
// Add new user
// Add new user + create account
app.post("/users", (req, res) => {
  const { persal_number, surname, role, email } = req.body;

  if (!persal_number || !surname || !role || !email) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required" });
  }

  // Insert into user table
  const sqlUser = `
    INSERT INTO user (persal_number, surname_initials, role, is_active)
    VALUES (?, ?, ?, 0)
  `;

  db.query(sqlUser, [persal_number, surname, role], (err, result) => {
    if (err) {
      console.error("❌ Error inserting user:", err);

      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          success: false,
          error: "User already exists with this Persal Number",
        });
      }

      return res.status(500).json({ success: false, error: "Database error" });
    }

    // ✅ Step 2: Generate password
    const password = generatePassword(email, persal_number);

    // ✅ Step 3: Save in account table
    const sqlAccount = `
      INSERT INTO account (persal_number, email, password)
      VALUES (?, ?, ?)
    `;

    db.query(sqlAccount, [persal_number, email, password], (err2) => {
      if (err2) {
        console.error("❌ Error inserting account:", err2);
        return res.status(500).json({
          success: false,
          error: "Database error while creating account",
        });
      }

      res.json({
        success: true,
        message: "User and account created successfully",
        userId: result.insertId,
        generatedPassword: password, // ⚡ you might not want to send this in production
      });
    });
  });
});

// utils/passwordGenerator.js

function generatePassword(email, persalNumber) {
  // Take first 3 letters of email (before @)
  const emailPart = email.split("@")[0].slice(0, 3).toUpperCase();

  // Take last 3 digits of persal number
  const persalPart = persalNumber.toString().slice(-3);

  // Random string (6 chars)
  const randomStr = Math.random().toString(36).slice(-6);

  // Ensure at least one special char
  const specialChars = "!@#$%^&*";
  const specialChar =
    specialChars[Math.floor(Math.random() * specialChars.length)];

  // Final password format
  const password = `${emailPart}${persalPart}${randomStr}${specialChar}`;

  console.log("Special password", password);
  return password;
}

module.exports = generatePassword;

//Get available users
app.get("/worker", (req, res) => {
  const role = req.query.role;

  if (!role) {
    return res
      .status(400)
      .json({ success: false, message: "Role is required." });
  }

  const sql = `
    SELECT persal_number, surname_initials 
    FROM user 
    WHERE role = ? AND is_active = ?
  `;

  db.query(sql, [role, 0], (err, results) => {
    if (err) {
      console.error("Error fetching workers:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error." });
    }

    res.json({ success: true, workers: results });
  });
});

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chatbot endpoint
app.post("/chatbot", async (req, res) => {
  try {
    const { message, history } = req.body;
    console.log("logging message:", message);
    console.log("logging history:", history);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // cheaper & fast
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant for DocuTracker.",
        },
        { role: "user", content: message },
      ],
    });

    res.json({
      reply: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: "Something went wrong with the chatbot" });
  }
});

/*REPORT METRICS*/
// Utility function for percentage change
/*function calcChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return (((current - previous) / previous) * 100).toFixed(1);
}*/

// GET metrics (callback style)
app.get("/api/metrics", (req, res) => {
  const { role, persal } = req.query;

  let wherePersal = "";
  if (role !== "MANAGER" || role !== "RUNNER") {
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

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching metrics:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const d = results[0];

    // --- Calculate derived metrics ---
    const tasksChange = calcChange(
      d.tasksCompletedCurrent,
      d.tasksCompletedPrevious
    );

    const errorRateCurrent =
      d.totalTasksCurrent > 0
        ? ((d.errorsCurrent / d.totalTasksCurrent) * 100).toFixed(1)
        : 0;
    const errorRatePrevious =
      d.totalTasksPrevious > 0
        ? ((d.errorsPrevious / d.totalTasksPrevious) * 100).toFixed(1)
        : 0;
    const errorRateChange = calcChange(errorRateCurrent, errorRatePrevious);

    const engagementCurrent =
      d.totalUsers > 0
        ? ((d.activeUsersCurrent / d.totalUsers) * 100).toFixed(1)
        : 0;
    const engagementPrevious =
      d.totalUsers > 0
        ? ((d.activeUsersPrevious / d.totalUsers) * 100).toFixed(1)
        : 0;
    const engagementChange = calcChange(engagementCurrent, engagementPrevious);

    res.json({
      tasksCompleted: {
        current: d.tasksCompletedCurrent,
        previous: d.tasksCompletedPrevious,
        change: tasksChange + "%",
      },
      errorRate: {
        current: errorRateCurrent + "%",
        previous: errorRatePrevious + "%",
        change: errorRateChange + "%",
      },
      userEngagement: {
        current: engagementCurrent + "%",
        previous: engagementPrevious + "%",
        change: engagementChange + "%",
      },
    });
  });
});

// Get reports
app.get("/api/reports", (req, res) => {
  const { role, persal } = req.query; // pass role & persal from frontend

  let sql;
  let params = [];

  if (role === "MANAGER" || role === "RUNNER") {
    sql = `
      SELECT id, type, role, details, DATE_FORMAT(date, '%Y-%m-%d %H:%i') as createdAt
      FROM report
      ORDER BY date DESC
      LIMIT 20
    `;
  } else {
    sql = `
      SELECT r.id, r.type, r.role, r.details, DATE_FORMAT(r.date, '%Y-%m-%d %H:%i') as createdAt
      FROM report r
      JOIN task t ON r.task_id = t.id
      WHERE t.persal_number = ?
      ORDER BY r.date DESC
      LIMIT 20
    `;
    params = [persal];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("❌ Error fetching reports:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Helper to calculate % change
function calcChange(current, previous) {
  if (previous == 0 && current > 0) return 100;
  if (previous == 0 && current == 0) return 0;
  return (((current - previous) / previous) * 100).toFixed(1);
}

//GET ALL USERS
// GET all users
app.get("/api/users", (req, res) => {
  const sql = `
    SELECT persal_number AS persal, surname_initials, role, is_active
    FROM user
    WHERE role NOT LIKE "MANAGER"
    ORDER BY surname_initials
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching users:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

//delete users
// DELETE user by persal number
app.delete("/api/users/:persal", (req, res) => {
  const { persal } = req.params;

  if (!persal) {
    return res
      .status(400)
      .json({ success: false, error: "Persal number required" });
  }

  // Wrap deletions in a transaction to ensure consistency
  db.beginTransaction((err) => {
    if (err) {
      console.error("❌ Transaction error:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }

    // 1. Delete reports linked via tasks
    db.query(
      "DELETE r FROM report r INNER JOIN task t ON r.task_id = t.id WHERE t.persal_number = ?",
      [persal],
      (err) => {
        if (err)
          return db.rollback(() =>
            res
              .status(500)
              .json({ success: false, error: "Failed to delete reports" })
          );

        // 2. Delete tasks
        db.query(
          "DELETE FROM task WHERE persal_number = ?",
          [persal],
          (err) => {
            if (err)
              return db.rollback(() =>
                res
                  .status(500)
                  .json({ success: false, error: "Failed to delete tasks" })
              );

            // 3. Delete account
            db.query(
              "DELETE FROM account WHERE persal_number = ?",
              [persal],
              (err) => {
                if (err)
                  return db.rollback(() =>
                    res
                      .status(500)
                      .json({
                        success: false,
                        error: "Failed to delete account",
                      })
                  );

                // 4. Delete user
                db.query(
                  "DELETE FROM user WHERE persal_number = ?",
                  [persal],
                  (err, result) => {
                    if (err)
                      return db.rollback(() =>
                        res
                          .status(500)
                          .json({
                            success: false,
                            error: "Failed to delete user",
                          })
                      );

                    db.commit((err) => {
                      if (err)
                        return db.rollback(() =>
                          res
                            .status(500)
                            .json({ success: false, error: "Commit failed" })
                        );

                      if (result.affectedRows === 0) {
                        return res
                          .status(404)
                          .json({ success: false, error: "User not found" });
                      }

                      res.json({
                        success: true,
                        message:
                          "User and all related data deleted successfully",
                      });
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

//get user email
// Get user email by persal
app.get("/api/user/getUserMail/:persal", async (req, res) => {
  const persal = req.params.persal;

  try {
    const [rows] = db.query(
      "SELECT email FROM account WHERE persal_number = ? LIMIT 1",
      [persal]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ email: rows[0].email });
  } catch (err) {
    console.error("❌ Error fetching email:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
