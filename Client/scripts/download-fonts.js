const https = require('https');
const fs = require('fs');
const path = require('path');

const fonts = [
  {
    name: 'Inter-Regular.ttf',
    url: 'https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/Inter-Regular.ttf'
  },
  {
    name: 'Inter-Medium.ttf',
    url: 'https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/Inter-Medium.ttf'
  },
  {
    name: 'Inter-SemiBold.ttf',
    url: 'https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/Inter-SemiBold.ttf'
  },
  {
    name: 'Inter-Bold.ttf',
    url: 'https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/Inter-Bold.ttf'
  }
];

const fontsDir = path.join(__dirname, '..', 'assets', 'fonts');

// Ensure the fonts directory exists
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// Delete existing font files
fonts.forEach(font => {
  const filePath = path.join(fontsDir, font.name);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
});

fonts.forEach(font => {
  const filePath = path.join(fontsDir, font.name);
  const file = fs.createWriteStream(filePath);

  console.log(`Downloading ${font.name}...`);
  
  https.get(font.url, response => {
    if (response.statusCode !== 200) {
      console.error(`Failed to download ${font.name}: ${response.statusCode}`);
      fs.unlink(filePath, () => {});
      return;
    }

    response.pipe(file);

    file.on('finish', () => {
      file.close();
      const stats = fs.statSync(filePath);
      console.log(`Downloaded ${font.name} (${(stats.size / 1024).toFixed(2)} KB)`);
    });
  }).on('error', err => {
    fs.unlink(filePath, () => {});
    console.error(`Error downloading ${font.name}:`, err.message);
  });
}); 