const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String, required: true },
    fileName: { type: String, required: true },
    fileData: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    fileType: { type: String },
    uploadedBy: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);
