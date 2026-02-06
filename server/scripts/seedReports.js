/**
 * Database Seeding Script for Reports
 * 
 * This script inserts 5 sample Report entries into the MongoDB database.
 * 
 * Usage:
 *   node scripts/seedReports.js
 * 
 * Make sure to run this from the server directory with proper environment variables set.
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import the Report model
const Report = require('../models/Report');

// Sample report data matching the actual Report schema
const sampleReports = [
    {
        reportTitle: 'Q4 2025 Sales Performance Analysis',
        period: 'Q4 2025',
        category: 'Financial',
        status: 'Verified',
        generatedBy: 'Sales Department',
        metrics: [
            { label: 'Total Revenue', value: '₹2,450,000', trend: 'up' },
            { label: 'Deals Closed', value: '47', trend: 'up' },
            { label: 'Conversion Rate', value: '23.5%', trend: 'stable' }
        ],
        notes: 'Comprehensive analysis of sales performance for Q4 2025, including revenue trends, top-performing products, and regional breakdowns.'
    },
    {
        reportTitle: 'Annual Financial Audit Report 2025',
        period: 'FY 2025',
        category: 'Financial',
        status: 'Verified',
        generatedBy: 'Finance Team',
        metrics: [
            { label: 'Total Expenses', value: '₹1,850,000', trend: 'down' },
            { label: 'Profit Margin', value: '24.5%', trend: 'up' },
            { label: 'Budget Variance', value: '-3.2%', trend: 'stable' }
        ],
        notes: 'Complete financial audit covering all transactions, compliance checks, and risk assessments for fiscal year 2025.'
    },
    {
        reportTitle: 'Customer Growth & Retention Metrics',
        period: 'January 2026',
        category: 'Growth',
        status: 'Pending',
        generatedBy: 'Marketing Analytics',
        metrics: [
            { label: 'New Customers', value: '156', trend: 'up' },
            { label: 'Retention Rate', value: '87.3%', trend: 'stable' },
            { label: 'Churn Rate', value: '12.7%', trend: 'down' }
        ],
        notes: 'Analysis of customer acquisition costs, retention rates, and lifetime value projections for strategic planning.'
    },
    {
        reportTitle: 'Operational Efficiency Assessment',
        period: 'Q1 2026',
        category: 'Operational',
        status: 'Pending',
        generatedBy: 'Operations Manager',
        metrics: [
            { label: 'Process Efficiency', value: '92%', trend: 'up' },
            { label: 'Resource Utilization', value: '78%', trend: 'stable' },
            { label: 'Downtime Hours', value: '12.5', trend: 'down' }
        ],
        notes: 'Evaluation of operational processes, resource utilization, and efficiency metrics across all departments.'
    },
    {
        reportTitle: 'Customer Satisfaction Survey Results',
        period: 'December 2025',
        category: 'Satisfaction',
        status: 'Verified',
        generatedBy: 'Customer Success Team',
        metrics: [
            { label: 'Overall Satisfaction', value: '4.6/5', trend: 'up' },
            { label: 'NPS Score', value: '72', trend: 'up' },
            { label: 'Response Rate', value: '68%', trend: 'stable' }
        ],
        notes: 'Comprehensive customer satisfaction survey results with detailed feedback analysis and improvement recommendations.'
    }
];

/**
 * Connect to MongoDB and seed the database
 */
const seedDatabase = async () => {
    try {
        // Connect to MongoDB (try cloud first, fallback to local)
        let connectionString = process.env.MONGO_URI_CLOUD || process.env.MONGO_URI_LOCAL;

        if (!connectionString) {
            throw new Error('No MongoDB connection string found in environment variables');
        }

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(connectionString);
        console.log('✅ Connected to MongoDB');

        // Clear existing reports (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing reports...');
        const deleteResult = await Report.deleteMany({});
        console.log(`✅ Cleared ${deleteResult.deletedCount} existing reports`);

        // Insert sample reports
        console.log('📝 Inserting sample reports...');
        const insertedReports = await Report.insertMany(sampleReports);
        console.log(`✅ Successfully inserted ${insertedReports.length} reports`);

        // Display inserted reports
        console.log('\n📊 Inserted Reports:');
        insertedReports.forEach((report, index) => {
            console.log(`\n${index + 1}. ${report.reportTitle}`);
            console.log(`   ID: ${report._id}`);
            console.log(`   Period: ${report.period}`);
            console.log(`   Category: ${report.category}`);
            console.log(`   Status: ${report.status}`);
            console.log(`   Metrics: ${report.metrics.length} items`);
            console.log(`   Created: ${report.createdAt.toISOString()}`);
        });

        console.log('\n✨ Database seeding completed successfully!');

    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        // Close the database connection
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
};

// Run the seeding function
seedDatabase();
