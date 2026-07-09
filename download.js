const https = require('https');
const fs = require('fs');

const sites = {
  'luxestyle': 'https://api.microlink.io?url=https://luxestyle-ten.vercel.app/&screenshot=true&embed=screenshot.url',
  'agrichain': 'https://api.microlink.io?url=https://agrichain-demo-app.vercel.app/&screenshot=true&embed=screenshot.url',
  'gensathi': 'https://api.microlink.io?url=https://spirit-rho.vercel.app/&screenshot=true&embed=screenshot.url'
};

async function download() {
  for (const [name, url] of Object.entries(sites)) {
    console.log(`Downloading ${name}...`);
    await new Promise((resolve) => {
      https.get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          https.get(res.headers.location, (redirectRes) => {
            const file = fs.createWriteStream(`${name}.png`);
            redirectRes.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
          });
        } else {
          const file = fs.createWriteStream(`${name}.png`);
          res.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        }
      });
    });
    console.log(`Saved ${name}.png`);
  }
}

download();
