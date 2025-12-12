const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// task routes
router.post("/assign", taskController.assignTask);
router.get("/", taskController.getUserTasks);
router.put("/:id/start", taskController.startTask);
router.put("/:id/end", taskController.endTask);
router.post("/:id/report", taskController.reportTask);

module.exports = router;
