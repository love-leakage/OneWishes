const fs = require('fs');

async function testUpload() {
  const fileContent = fs.readFileSync('package.json');
  const blob = new Blob([fileContent], { type: 'application/json' });
  const formData = new FormData();
  formData.append('file', blob, 'package.json');
  
  try {
    const res = await fetch('https://onewishes.com/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    console.log("RESPONSE:", data);
  } catch (err) {
    console.error("ERROR:", err);
  }
}

testUpload();
