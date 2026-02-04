const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const { authMiddleware } = require('../middleware/authMiddleware');

// Configure Multer for Memory Storage (Since we are storing in DB)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.doc', '.docx', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only .doc, .docx, and .pdf files are allowed!'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GET all documents (Metadata only for performance)
router.get('/', authMiddleware(), async (req, res) => {
    try {
        const documents = await Document.find().select('-fileData').sort({ createdAt: -1 });
        res.json(documents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPLOAD Document (Store in DB)
router.post('/', authMiddleware(), upload.single('file'), async (req, res) => {
    try {
        const { name, email, company } = req.body;
        if (!req.file) return res.status(400).json({ error: 'Please upload a file' });

        const newDoc = new Document({
            name,
            email,
            company,
            fileName: req.file.originalname,
            fileData: req.file.buffer,
            contentType: req.file.mimetype,
            fileType: path.extname(req.file.originalname),
            uploadedBy: req.user ? req.user.name : 'Unknown'
        });

        await newDoc.save();
        res.status(201).json({ message: 'Document secured in vault.', docId: newDoc._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE Document Metadata & File
router.put('/:id', authMiddleware(), upload.single('file'), async (req, res) => {
    try {
        const { name, email, company } = req.body;
        const updateData = { name, email, company };

        if (req.file) {
            updateData.fileName = req.file.originalname;
            updateData.fileData = req.file.buffer;
            updateData.contentType = req.file.mimetype;
            updateData.fileType = path.extname(req.file.originalname);
        }

        const updatedDoc = await Document.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-fileData');

        if (!updatedDoc) return res.status(404).json({ error: 'Document not found' });
        res.json(updatedDoc);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE Document
router.delete('/:id', authMiddleware(), async (req, res) => {
    try {
        const doc = await Document.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });
        res.json({ message: 'Document decommissioned and purged from database.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// VIEW Document (Streaming from DB)
router.get('/view/:id', async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).send('Document not found in the vault.');

        if (!doc.fileData) {
            return res.status(400).send('Legacy document detected. This mission intelligence was stored on a decommissioned disk. Please re-upload this dossier to secure it in the primary database.');
        }

        res.set('Content-Type', doc.contentType || 'application/octet-stream');
        res.set('Content-Disposition', `inline; filename="${doc.fileName}"`);
        res.send(doc.fileData);
    } catch (err) {
        res.status(500).send('Encryption or retrieval error: ' + err.message);
    }
});

// DOWNLOAD Document (Forcing attachment from DB)
router.get('/download/:id', async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).send('Document not found.');

        if (!doc.fileData) {
            return res.status(400).send('Legacy document detected. Please re-upload to enable secure download.');
        }

        res.set('Content-Type', doc.contentType || 'application/octet-stream');
        res.set('Content-Disposition', `attachment; filename="${doc.fileName}"`);
        res.send(doc.fileData);
    } catch (err) {
        res.status(500).send('Transmission error: ' + err.message);
    }
});

module.exports = router;
