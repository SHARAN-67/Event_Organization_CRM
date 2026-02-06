const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedUsers = async () => {
    try {
        let connected = false;

        // Try Cloud Connection first
        if (process.env.MONGO_URI_CLOUD) {
            try {
                await mongoose.connect(process.env.MONGO_URI_CLOUD);
                console.log('☁️  Connected to MongoDB Cloud for Seeding');
                connected = true;
            } catch (e) {
                console.log('❌ Cloud connection failed:', e.message);
            }
        }

        // Fallback to Local
        if (!connected && process.env.MONGO_URI_LOCAL) {
            try {
                await mongoose.connect(process.env.MONGO_URI_LOCAL);
                console.log('🏠 Connected to MongoDB Local for Seeding');
                connected = true;
            } catch (e) {
                console.log('❌ Local connection failed:', e.message);
            }
        }

        if (!connected) {
            throw new Error("Could not connect to any database.");
        }

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
                jobTitle: 'System Administrator',
                isOnline: false
            },
            {
                agId: 'AG-0002',
                name: 'Peter Parker',
                email: 'peter@cnevents.com',
                password: 'peter@123',
                role: 'Assistant',
                jobTitle: 'Sales Assistant',
                isOnline: false
            },
            {
                agId: 'AG-0003',
                name: 'John Doe',
                email: 'jhon@cnevents.com', // Keeping 'jhon' as typed by user
                password: 'jhon@123',
                role: 'Lead Planner',
                jobTitle: 'Senior Planner',
                isOnline: false
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

        console.log('✅ RBAC Seed Complete');
        process.exit(0);
    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

seedUsers();
