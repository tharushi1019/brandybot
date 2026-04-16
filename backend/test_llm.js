require('dotenv').config();
const { generateLogoAgentReply } = require('./services/llmService');

async function run() {
  try {
    const res = await generateLogoAgentReply({
      message: 'Hi',
      history: [],
      brandContext: {}
    });
    console.log("Result:", res);
  } catch (err) {
    console.error("Fatal:", err);
  }
}
run();
