const https = require('https');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../assets');

// Create assets directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Download function
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destination, () => {}); // Delete the file if there's an error
      reject(err);
    });
  });
}

// Download landing page background
const landingBgUrl = 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070&auto=format&fit=crop';
const landingBgPath = path.join(assetsDir, 'landing-bg.jpg');

console.log('Downloading landing page background...');
downloadFile(landingBgUrl, landingBgPath)
  .then(() => {
    console.log('Landing page background downloaded successfully!');
  })
  .catch((error) => {
    console.error('Error downloading landing page background:', error);
  }); 