const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Report = require('../models/Report');
const { authMiddleware } = require('../middleware/authMiddleware');

// Configure Multer for Memory Storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get all reports (Metadata only)
router.get('/', authMiddleware(['Admin', 'Lead Planner']), async (req, res) => {
    try {
        const reports = await Report.find().select('-fileData').sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a report with file
router.post('/', authMiddleware(['Admin']), upload.single('file'), async (req, res) => {
    try {
        const reportData = { ...req.body };

        // Handle metrics if sent as JSON string
        if (typeof reportData.metrics === 'string') {
            reportData.metrics = JSON.parse(reportData.metrics);
        }

        if (req.file) {
            reportData.fileName = req.file.originalname;
            reportData.fileData = req.file.buffer;
            reportData.contentType = req.file.mimetype;
        }

        const newReport = new Report(reportData);
        const savedReport = await newReport.save();

        // Return without buffer
        const response = savedReport.toObject();
        delete response.fileData;
        res.status(201).json(response);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a report with file
router.put('/:id', authMiddleware(['Admin']), upload.single('file'), async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Handle metrics if sent as JSON string
        if (typeof updateData.metrics === 'string') {
            updateData.metrics = JSON.parse(updateData.metrics);
        }

        if (req.file) {
            updateData.fileName = req.file.originalname;
            updateData.fileData = req.file.buffer;
            updateData.contentType = req.file.mimetype;
        }

        const updatedReport = await Report.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-fileData');

        if (!updatedReport) return res.status(404).json({ error: 'Report not found' });
        res.json(updatedReport);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Download Report File
router.get('/download/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report || !report.fileData) return res.status(404).send('File not found.');

        res.set('Content-Type', report.contentType || 'application/octet-stream');
        res.set('Content-Disposition', `attachment; filename="${report.fileName}"`);
        res.send(report.fileData);
    } catch (err) {
        res.status(500).send('Error retrieving report archive.');
    }
});

// Delete a report
router.delete('/:id', authMiddleware(['Admin']), async (req, res) => {
    try {
        const deletedReport = await Report.findByIdAndDelete(req.params.id);
        if (!deletedReport) return res.status(404).json({ error: 'Report not found' });
        res.json({ message: 'Report deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
