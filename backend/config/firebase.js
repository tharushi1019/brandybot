const admin = require('firebase-admin');
const { getConfig } = require('./env');

const setupFirebase = () => {
    const config = getConfig();

    try {
        if (!config.firebase.projectId || !config.firebase.privateKey || !config.firebase.clientEmail) {
            console.warn('⚠️ Firebase Admin SDK config missing - Auth features will not work');
            return null;
        }

        // Handle private key formatting (replace \n with real newlines)
        const privateKey = config.firebase.privateKey.replace(/\\n/g, '\n');

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: config.firebase.projectId,
                clientEmail: config.firebase.clientEmail,
                privateKey: privateKey
            })
        });

        console.log('✅ Firebase Admin SDK Initialized');
        return admin;
    } catch (error) {
        console.error('❌ Firebase Admin SDK Initialization Error:', error.message);
        return null;
    }
};

module.exports = setupFirebase;
