const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/admin_db';

const seedUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear ALL users to avoid duplicates/conflicts for testing
        await User.deleteMany({});

        const passwordHash = await bcrypt.hash('password123', 10);

        const users = [
            {
                agId: 'AG-0001',
                name: 'Admin User',
                email: 'admin@cnevents.com',
                password: 'password123',
                role: 'Admin',
                jobTitle: 'System Administrator'
            },
            {
                agId: 'AG-0002',
                name: 'Peter Parker',
                email: 'peter@cnevents.com',
                password: 'peter@123',
                role: 'Assistant',
                jobTitle: 'Sales Assistant'
            },
            {
                agId: 'AG-0003',
                name: 'John Doe',
                email: 'jhon@cnevents.com', // Keeping 'jhon' as typed by user
                password: 'jhon@123',
                role: 'Lead Planner',
                jobTitle: 'Senior Planner'
            }
        ];

        for (const u of users) {
            // Check if exists (redundant due to deleteMany but safe)
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                const user = new User(u);
                await user.save();
                console.log(`Created user: ${u.email} (${u.role})`);
            }
        }

        console.log('RBAC Seed Complete');
        process.exit(0);
    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

seedUsers();
