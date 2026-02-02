const { generateLogoAI, chatAI, generateMockupAI } = require('./services/aiService');

const runIntegrationTest = async () => {
    console.log('🔄 Testing Integration: Backend <-> AI Service');

    try {
        // 1. Test Logo Generation
        console.log('\n🎨 Testing Logo Generation...');
        const logoResult = await generateLogoAI({
            brand_name: "TestBrand",
            prompt: "A futuristic tech logo",
            style: "minimalist"
        });
        console.log('✅ Logo Response:', logoResult.url);

        // 2. Test Chat
        console.log('\n💬 Testing Chat...');
        const chatResult = await chatAI({
            message: "Hello AI",
            context: "logo_creation"
        });
        console.log('✅ Chat Response:', chatResult.response);

        // 3. Test Mockup
        console.log('\n👕 Testing Mockup...');
        const mockupResult = await generateMockupAI({
            logo_url: "http://example.com/logo.png",
            template_type: "tshirt"
        });
        console.log('✅ Mockup Response:', mockupResult.url);

        console.log('\n🎉 All Integration Tests Passed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Integration Test Failed:', error.message);
        process.exit(1);
    }
};

runIntegrationTest();
