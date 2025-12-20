import Automate from "../models/Automate.js";
import { v4 as uuidv4 } from 'uuid';
//const { v4: uuidv4 } = require("uuid");

/**
 * GET /api/automate?role=
 */
export const getBest = async (req, res) => {
  try {
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({
        success: false,
        code: "ROLE_REQUIRED",
        message: "role query parameter is required",
      });
    }

    const result = await Automate.getBestRecordByRole(role);

    if (!result) {
      return res.status(404).json({
        success: false,
        code: "NO_RECORD_FOUND",
        message: "No record found for the given role",
      });
    }

    return res.status(200).json({
      success: true,
      code: "BEST_RECORD_FOUND",
      data: result,
    });
  } catch (err) {
    console.error("getBest error:", err);
    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Failed to fetch best record",
    });
  }
};

/**
 * POST /api/automate/assign?role="SCANNER"
 */ export const assign = async (req, res) => {
    console.log(req.body);

  try {
    const { batch_number, role, assignedTo, persal_number } = req.body;

    

    if (!batch_number || !role || !assignedTo || !persal_number) {
      return res.status(400).json({
        success: false,
        code: "INVALID_INPUT",
        message:
          "batch_number, role, assignedTo and persal_number are required",
      });
    }

    const id = uuidv4();
    const date = new Date().toISOString().slice(0, 10);

    const assignment = await Automate.assignTask({
      id,
      batch_number,
      role,
      date,
      assignedTo,
      persal_number,
      status: "",
    });

    return res.status(201).json({
      success: true,
      code: "TASK_ASSIGNED",
      message: "Assignment created successfully",
      data: assignment,
    });
  } catch (err) {
    console.error("assign error:", err);
    return res.status(500).json({
      success: false,
      code: "ASSIGN_FAILED",
      message: "Failed to assign task",
    });
  }
};
