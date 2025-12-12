const dotenv = require("dotenv");
dotenv.config();
const Dashboard = require("../models/Dashboard");

exports.getDashboard = async (req, res) => {
  try {
    const { id, role } = req.query;
    console.log("📊 Preparing dashboard for", id, role);

    // Worker Stats
    const workerStats = await Dashboard.getWorkerStats(id);
    const workerReports = await Dashboard.getWorkerReportCount(id);

    workerStats.avgCompletionTime = workerStats.avgCompletionTime
      ? `${Math.floor(workerStats.avgCompletionTime / 60)}m ${
          workerStats.avgCompletionTime % 60
        }s`
      : "N/A";

    workerStats.totalReports = workerReports.totalReports;
    workerStats.efficiencyScore =
      workerStats.totalTasks > 0
        ? Math.round(
            (workerStats.completedTasks / workerStats.totalTasks) * 100
          )
        : 0;

    // If NOT manager → return worker dashboard only
    if (role !== "MANAGER" && role !== "RUNNER") {
      return res.json({ success: true, workerDashboard: workerStats });
    }

    // Manager Stats
    const managerStats = await Dashboard.getManagerStats();
    const activeMembers = await Dashboard.getActiveMembers();
    const reportSummary = await Dashboard.getReportsSummary();

    managerStats.activeMembers = activeMembers.activeMembers;
    managerStats.reportsSummary = reportSummary;

    managerStats.avgCompletionTime = managerStats.avgCompletionTime
      ? `${Math.floor(managerStats.avgCompletionTime / 60)}m ${
          managerStats.avgCompletionTime % 60
        }s`
      : "N/A";

    res.json({
      success: true,
      workerDashboard: workerStats,
      managerDashboard: managerStats,
    });
  } catch (err) {
    console.error("❌ Dashboard error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};


