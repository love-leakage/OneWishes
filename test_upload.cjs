const fs = require('fs');

async function testUpload() {
  const fileContent = fs.readFileSync('package.json');
  
  try {
    const res = await fetch('https://onewishes.com/api/upload?filename=package.json&type=application/json', {
      method: 'POST',
      body: fileContent,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    console.log("RESPONSE:", data);
  } catch (err) {
    console.error("ERROR:", err);
  }
}

testUpload();
