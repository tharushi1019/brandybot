require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { generateLogoAI } = require('./services/aiService');

async function testReplicateGeneration() {
    console.log('\n=== 🎨 Testing Replicate Image Generation ===');
    console.log('REPLICATE_API_TOKEN is set:', !!process.env.REPLICATE_API_TOKEN);

    if (!process.env.REPLICATE_API_TOKEN) {
        console.error('❌ REPLICATE_API_TOKEN is not configured! Please configure it in .env');
        process.exit(1);
    }

    try {
        const payload = {
            brand_name: 'BrandyBot Test',
            prompt: 'minimalist shield vector logo, clean lines, professional',
            style: 'minimalist',
            industry: 'tech',
            colors: ['#7C3AED', '#3B82F6']
        };

        console.log('📝 Prompt Payload:', payload);
        console.log('🚀 Triggering image generation (this can take 10-30s)...');

        const startTime = Date.now();
        const result = await generateLogoAI(payload);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(`\n✅ Image generated successfully in ${duration}s!`);
        console.log('Metadata:', result.metadata);
        console.log('Output URL starts with:', result.url.substring(0, 100) + '...');

        // Verify it is a valid base64 data URL
        if (result.url.startsWith('data:image/')) {
            console.log('👍 Output is a valid base64 Data URL!');
            
            // Extract and save the base64 image data to local disk to verify visually
            const match = result.url.match(/^data:image\/(\w+);base64,(.+)$/);
            if (match) {
                const ext = match[1];
                const base64Data = match[2];
                const outputPath = path.join(__dirname, `test-generated-logo.${ext}`);
                
                fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
                console.log(`💾 Saved generated image to: ${outputPath}`);
            } else {
                console.warn('⚠️ Could not parse base64 URL format to write to disk.');
            }
        } else {
            console.error('❌ Output URL is not a base64 Data URL! Got:', result.url);
        }

    } catch (error) {
        console.error('❌ Generation Failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

testReplicateGeneration()
    .then(() => {
        console.log('=== Test Completed Successfully ===\n');
        process.exit(0);
    })
    .catch(() => process.exit(1));
