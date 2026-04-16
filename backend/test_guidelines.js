require('dotenv').config();
const { generateBrandGuidelines } = require('./services/llmService');

async function run() {
  try {
    const res = await generateBrandGuidelines({
      brandName: "flower Sisters",
      industry: "florist",
      logoColors: { primary: "#7C3AED", secondary: "#3B82F6", accent: "#F59E0B" }
    });
    console.log("Result:", res);
  } catch (err) {
    console.error("Fatal:", err);
  }
}
run();
