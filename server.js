// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./config/db");
const OpenAI = require("openai");
const dotenv = require("dotenv");

// Import routes
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const metricRoutes = require("./routes/metricsRoutes");
const reportRoutes = require("./routes/reportRoutes");

dotenv.config();
const PORT = process.env.PORT || 3000;
const path = require("path");
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public")); // MUST be before any routes

// app routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/metrics", metricRoutes);
app.use("/api/reports", reportRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

/*


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


// Helper to calculate % change
function calcChange(current, previous) {
  if (previous == 0 && current > 0) return 100;
  if (previous == 0 && current == 0) return 0;
  return (((current - previous) / previous) * 100).toFixed(1);
}

/

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

*/
