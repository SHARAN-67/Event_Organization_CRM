const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI_CLOUD);
        console.log('Connected to MongoDB Cloud');

        const users = await User.find({}, 'name email role agId');
        console.log('\n--- Current Users in DB ---');
        users.forEach(u => {
            console.log(`- ${u.name} (${u.email}) [${u.role}] ID: ${u.agId}`);
        });
        console.log('---------------------------\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
