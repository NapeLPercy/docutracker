const dotenv = require("dotenv");
dotenv.config();
const Metrics = require("../models/Metrics");

function calcChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return (((current - previous) / previous) * 100).toFixed(1);
}

exports.getMetrics = async (req, res) => {
  try {
    const { role, persal } = req.query;
    const d = await Metrics.getMetrics(role, persal);

    // Derived calculations
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
      success: true,
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
  } catch (err) {
    console.error("❌ Metrics error:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
};
