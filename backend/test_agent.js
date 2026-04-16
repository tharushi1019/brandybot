const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/logo-agent/guest-message', {
      message: 'Hi',
      fingerprint: 'test-user-123'
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

test();
