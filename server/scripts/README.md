# Database Seeding Scripts

This directory contains scripts for seeding the database with sample data.

## Available Scripts

### seedReports.js

Seeds the database with 5 sample Report entries.

**Usage:**

```bash
# From the server directory
node scripts/seedReports.js
```

**What it does:**
- Connects to MongoDB (Cloud or Local based on .env)
- Clears existing reports (optional - can be commented out)
- Inserts 5 sample reports with different categories and statuses
- Displays summary of inserted data

**Sample Data Includes:**
- Q4 2025 Sales Performance Analysis (Financial, Verified)
- Annual Financial Audit Report 2025 (Financial, Verified)
- Customer Growth & Retention Metrics (Growth, Pending)
- Operational Efficiency Assessment (Operational, Pending)
- Customer Satisfaction Survey Results (Satisfaction, Verified)

## Prerequisites

1. Make sure MongoDB is running (local or cloud)
2. Ensure `.env` file is configured with proper MongoDB connection strings
3. Run from the `server` directory

## Environment Variables Required

```
MONGO_URI_CLOUD=mongodb+srv://...
MONGO_URI_LOCAL=mongodb://localhost:27017/admin_db
```

## Creating New Seed Scripts

Follow this template:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();
const YourModel = require('../models/YourModel');

const sampleData = [
    // Your sample data here
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI_CLOUD || process.env.MONGO_URI_LOCAL);
        await YourModel.deleteMany({});
        await YourModel.insertMany(sampleData);
        console.log('Seeding completed!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

seedDatabase();
```
