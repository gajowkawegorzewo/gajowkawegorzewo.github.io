const fs = require('fs');
const path = require('path');

/**
 * GAJÓWKA SITEMAP GENERATOR
 * Scans index.html and blog/ directory to build sitemap.xml
 */

const BASE_URL = 'https://gajowkawegorzewo.github.io';

async function generateSitemap() {
  const urls = [BASE_URL + '/'];
  
  // Scan blog directory
  const blogDir = path.resolve(__dirname, '../blog');
  if (fs.existsSync(blogDir)) {
    const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));
    files.forEach(f => {
      // Avoid index.html duplicate if it's there
      if (f !== 'index.html') {
        urls.push(`${BASE_URL}/blog/${f}`);
      } else {
        urls.push(`${BASE_URL}/blog/`);
      }
    });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>${url.includes('/blog/') ? 'weekly' : 'monthly'}</changefreq>
    <priority>${url.endsWith('/') ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.resolve(__dirname, '../sitemap.xml'), sitemap);
  console.log(`[SITEMAP] Wygenerowano sitemap.xml z ${urls.length} adresami.`);
}

generateSitemap();
