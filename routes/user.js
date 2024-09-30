const express = require("express");
const router = express.Router();

const protect = require('../middleware/authMiddleware'); // Import the middleware
const { getTasks, createTask, updateTask, deleteTask , generateTaskReport , getTaskById } = require('../controllers/taskController');
const {login , signup} = require("../controllers/auth");


router.post("/login" ,login);
router.post("/signup" ,signup);


 
router.post('/createTask', protect, createTask); 
router.get('/getTasks', protect, getTasks); 
router.get('/getTask/:id', protect, getTaskById); 
router.put('/updateTask/:id', protect, updateTask); 
router.delete('/deleteTask/:id', protect, deleteTask);

router.get('/report', protect, generateTaskReport);

module.exports = router;