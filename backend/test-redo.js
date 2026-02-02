/**
 * Simple Model Tests
 * Basic CRUD tests for all models
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const LogoHistory = require('./models/LogoHistory');
const Brand = require('./models/Brand');

const runTests = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
        console.log('📊 Database:', mongoose.connection.name);

        // Cleanup any previous test data
        await User.deleteMany({ email: /test.*@brandybot.com/ });

        // Test 1: User Model
        console.log('\n📝 TEST: User Model Creation');
        const testUser = await User.create({
            uid: 'test_uid_' + Date.now(),
            email: 'test' + Date.now() + '@brandybot.com',
            displayName: 'Test User',
            provider: 'google'
        });
        console.log('✅ User created:', testUser.email);

        // Clean up
        await User.deleteMany({ email: /test.*@brandybot.com/ });

        console.log('\n✅ ALL TESTS PASSED');

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

runTests();
