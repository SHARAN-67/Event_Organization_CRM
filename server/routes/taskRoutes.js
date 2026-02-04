const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireAccess } = require('../middleware/rbacMiddleware');
const { PERMISSIONS } = require('../security/rbacPolicy');

// Create a new task - automatically assigned to the logged-in user
router.post('/', authMiddleware(), requireAccess(PERMISSIONS.TASKS.MANAGE, 'tasks'), async (req, res) => {
    try {
        const { title, description, priority, dueDate } = req.body;

        const newTask = new Task({
            title,
            description: description || '',
            priority: priority || 'medium',
            dueDate: dueDate || null,
            userId: req.user.id // Assign task to the logged-in user
        });

        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all tasks for the logged-in user (personal workspace)
router.get('/', authMiddleware(), requireAccess(PERMISSIONS.TASKS.VIEW, 'tasks'), async (req, res) => {
    try {
        // Only fetch tasks belonging to the current user
        const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all tasks (Admin only - for viewing all users' tasks)
// Admin only override
router.get('/all', authMiddleware(['Admin']), async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a task - only owner can update their own task
router.put('/:id', authMiddleware(), requireAccess(PERMISSIONS.TASKS.MANAGE, 'tasks'), async (req, res) => {
    try {
        const { title, description, isCompleted, priority, dueDate } = req.body;

        // Find the task and verify ownership
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if user owns this task (Admin can bypass)
        if (task.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'You can only update your own tasks' });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    title: title !== undefined ? title : task.title,
                    description: description !== undefined ? description : task.description,
                    isCompleted: isCompleted !== undefined ? isCompleted : task.isCompleted,
                    priority: priority !== undefined ? priority : task.priority,
                    dueDate: dueDate !== undefined ? dueDate : task.dueDate,
                    updatedAt: Date.now()
                }
            },
            { new: true }
        );

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete a task - only owner can delete their own task
// We use MANAGE here because deleting your OWN task is considered management.
// ROOT would be for deleting OTHER people's tasks (which isn't implemented here anyway except via Admin)
router.delete('/:id', authMiddleware(), requireAccess(PERMISSIONS.TASKS.MANAGE, 'tasks'), async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if user owns this task (Admin can bypass)
        if (task.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'You can only delete your own tasks' });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
