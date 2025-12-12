const Report = require("../models/Report");

exports.getUserReports = async (req, res) => {
  const { role, persal } = req.query;

  try {
    const reports = await Report.getReports(role, persal);
    res.json(reports);
  } catch (err) {
    console.error("❌ Error fetching reports:", err);
    res.status(500).json({ error: "Database error" });
  }
};
