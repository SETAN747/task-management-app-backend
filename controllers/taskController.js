const Task = require('../models/task'); // Assuming Task model is in 'models/Task.js'
const User = require('../models/user');

// Create a task (Admin can assign tasks to others)
const createTask = async (req, res) => {
    const { title, description, dueDate, status, assignedUser, priority } = req.body;

    try {
        // Only admins can assign tasks to other users
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can create and assign tasks' });
        }

        const task = new Task({
            title,
            description,
            dueDate,
            status,
            assignedUser,
            priority,
            createdBy: req.user.id, // Logged-in admin's ID
        });

        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get all tasks for the logged-in user (Admin sees all, non-admin sees only their tasks)
const getTasks = async (req, res) => {
    try {
        let tasks;

        if (req.user.role === 'admin') {
            // Admin can see all tasks
            tasks = await Task.find({});
        } else {
            // Non-admin can see only their own tasks or tasks assigned to them
            tasks = await Task.find({
                $or: [{ createdBy: req.user.id }, { assignedUser: req.user.id }],
            });
        }

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get a specific task by ID (Admins can see all, non-admins see their own tasks only)
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Admins can view all tasks; non-admins only their own or assigned ones
        if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id && task.assignedUser.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update a task (Admin can update any task, non-admin can update their own)
const updateTask = async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Non-admin users can only update their own tasks
        if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id && task.assignedUser.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete a task (Admin can delete any task, non-admin can delete only their own)
const deleteTask = async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Non-admin users can only delete their own tasks
        if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const { Parser } = require('json2csv'); // Library to convert JSON to CSV

// Generate task report based on filters (status, user, date)
const generateTaskReport = async (req, res) => {
    const { status, user, startDate, endDate, format } = req.query;

    try {
        // Build a query object
        let query = {};

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by assigned user (user ID)
        if (user) {
            query.assignedUser = user;
        }

        // Filter by date range
        if (startDate || endDate) {
            query.dueDate = {};
            if (startDate) query.dueDate.$gte = new Date(startDate);
            if (endDate) query.dueDate.$lte = new Date(endDate);
        }

        // Fetch tasks based on the query
        const tasks = await Task.find(query).populate('assignedUser', 'email'); // Optional: populate user email

        // If 'format' query is 'csv', return CSV file
        if (format && format.toLowerCase() === 'csv') {
            const fields = ['title', 'description', 'dueDate', 'status', 'priority', 'assignedUser.email'];
            const opts = { fields };

            // Convert tasks JSON to CSV format
            const parser = new Parser(opts);
            const csv = parser.parse(tasks);

            // Set response headers for CSV download
            res.header('Content-Type', 'text/csv');
            res.attachment('task_report.csv');
            return res.send(csv);
        }

        // Default: return JSON response
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    generateTaskReport,
};
