const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // This allows the frontend to talk to the backend
app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const emailRoutes = require('./routes/emailRoutes');
const eventRoutes = require('./routes/eventRoutes');
const contactRoutes = require('./routes/contactRoutes');
const taskRoutes = require('./routes/taskRoutes');
const orderRoutes = require('./routes/orderRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const dealRoutes = require('./routes/dealRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const documentRoutes = require('./routes/documentRoutes');
const secretRoutes = require('./routes/secretRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

// MongoDB Connection Status
let dbStatus = "Disconnected";

const connectDB = async () => {
  try {
    // Try Cloud Connection first
    await mongoose.connect(process.env.MONGO_URI_CLOUD);
    dbStatus = "Online (Cloud)";
    console.log("☁️  MongoDB Cloud Connected");
  } catch (cloudErr) {
    console.error("❌ Cloud MongoDB Connection Error, falling back to local:", cloudErr.message);
    try {
      // Fallback to Local Connection
      await mongoose.connect(process.env.MONGO_URI_LOCAL);
      dbStatus = "Local (Fallback)";
      console.log("🏠 MongoDB Local Connected");
    } catch (localErr) {
      dbStatus = "Error Connecting";
      console.error("❌ Local MongoDB Connection Error:", localErr.message);
    }
  }
};

connectDB();

app.use('/api/emails', emailRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/secret', secretRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/status', (req, res) => {
  res.json({
    message: "MERN Backend is Connected!",
    dbStatus: dbStatus
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error("Server error:", err);
});

process.on('exit', (code) => {
  console.log(`Process exited with code: ${code}`);
});

process.on('SIGINT', () => {
  console.log("Caught interrupt signal");
  process.exit();
});