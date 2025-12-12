const dotenv = require("dotenv");
dotenv.config();// controllers/taskController.js
const Task = require("../models/Task");

exports.assignTask = async (req, res) => {
  try {
    const taskData = req.body;
    const result = await Task.assignTask(taskData);
    res.json({ success: true, message: "Task assigned successfully", taskId: result.taskId });
  } catch (err) {
    console.error("Assign task error:", err);
    res.status(500).json({ success: false, error: err.message || "Server error" });
  }
};



exports.getUserTasks = async (req, res) => {
  try {
    const { id: persalNumber, role } = req.query;
    const tasks = await Task.getUserTasks(persalNumber, role);
    res.json({ success: true, tasks });
  } catch (err) {
    console.error("Get user tasks error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.startTask = async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const { persalNumber } = req.body;
    const result = await Task.startTask(taskId, persalNumber);
    res.json({ success: true, message: "Task started", ...result });
  } catch (err) {
    console.error("Start task error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.endTask = async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const { persalNumber } = req.body;
    const result = await Task.endTask(taskId, persalNumber);
    res.json({ success: true, message: "Task ended", ...result });
  } catch (err) {
    console.error("End task error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.reportTask = async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const reportData = req.body;
    const result = await Task.reportTask(taskId, reportData);
    res.json({ success: true, message: "Report created", ...result });
  } catch (err) {
    console.error("Report task error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
