require('dotenv').config();
const axios = require('axios');

async function test() {
    console.log('\n=== Testing AI Service (Updated) ===');
    console.log('AI_SERVICE_URL:', process.env.AI_SERVICE_URL);

    if (!process.env.AI_SERVICE_URL) {
        console.error('❌ AI_SERVICE_URL not set!');
        return;
    }

    try {
        const baseUrl = process.env.AI_SERVICE_URL.replace(/\/$/, '');
        const aiEndpoint = `${baseUrl}/generate`;
        const prompt = 'minimal dragon tech logo, neon blue';
        console.log(`POST ${aiEndpoint}?prompt=${encodeURIComponent(prompt)}`);

        const res = await axios.post(
            `${aiEndpoint}?prompt=${encodeURIComponent(prompt)}`,
            null,
            {
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                },
                timeout: 90000
            }
        );
        console.log('✅ SUCCESS! Status:', res.status);
        console.log('Response Keys:', Object.keys(res.data));
        if (res.data.image_base64) {
            console.log('Base64 length:', res.data.image_base64.length);
        } else {
            console.log('❌ Missing image_base64 in response');
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            const body = Buffer.from(err.response.data).toString('utf8', 0, 300);
            console.error('Response:', body);
        }
    }
}

test().then(() => process.exit(0)).catch(() => process.exit(1));
