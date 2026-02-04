const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/admin_db';

const checkAndCleanup = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Remove the test users we created
        const testEmails = ['admin@example.com', 'assistant@example.com', 'planner@example.com'];
        const deleteResult = await User.deleteMany({ email: { $in: testEmails } });
        console.log(`Deleted ${deleteResult.deletedCount} test users.`);

        // 2. List remaining users to verify roles
        const users = await User.find({}, 'name email role');
        console.log('--- Remaining Users ---');
        if (users.length === 0) {
            console.log('NO USERS FOUND! The user said they were "already available". This might be an issue.');
        } else {
            users.forEach(u => {
                console.log(`- ${u.name} (${u.email}) [Role: ${u.role}]`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkAndCleanup();
