const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// user routes
router.post('/addUser', authController.addUser);
router.post('/login', authController.login);

router.get("/users", authController.getUsers);
router.delete("/users/:persal", authController.deleteUser);


module.exports = router;
