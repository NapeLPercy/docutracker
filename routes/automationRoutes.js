const express = require("express");
const router = express.Router();
const automationController = require("../controllers/automationController");

router.get("/get", automationController.getBest);     // ?role=
router.post("/assign", automationController.assign);

module.exports = router;