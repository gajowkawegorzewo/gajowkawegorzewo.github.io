const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * GAJÓWKA SEO INDEXER
 * Pushes URLs to Google Indexing API and Bing IndexNow.
 */

async function pushToIndexNow(urls) {
  console.log(`[INDEX] Wysyłanie ${urls.length} URLi do IndexNow (Bing/Yandex)...`);
  
  const host = 'gajowkawegorzewo.pl';
  const key = process.env.INDEXNOW_KEY || 'default_key'; // Recommended: use a persistent key
  
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `https://${host}/${key}.txt`,
        urlList: urls
      })
    });
    
    if (res.ok) console.log('[SUCCESS] IndexNow OK');
    else console.warn(`[WARN] IndexNow HTTP ${res.status}`);
  } catch (e) {
    console.error('[ERROR] IndexNow failed:', e.message);
  }
}

async function getGoogleAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  })).toString('base64url');
  const toSign = `${header}.${payload}`;
  const sig = crypto.createSign('RSA-SHA256').update(toSign).sign(sa.private_key).toString('base64url');
  const jwt = `${toSign}.${sig}`;

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  
  if (!resp.ok) throw new Error(`Token exchange failed: ${resp.status}`);
  const data = await resp.json();
  return data.access_token;
}

async function pushToGoogle(url, accessToken) {
  const resp = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url, type: 'URL_UPDATED' })
  });
  return resp.ok;
}

async function main() {
  const urls = process.argv.slice(2);
  if (urls.length === 0) {
    console.log('Usage: node scripts/index-push.js https://example.com/page1 https://example.com/page2');
    process.exit(1);
  }

  // 1. IndexNow
  await pushToIndexNow(urls);

  // 2. Google Indexing (needs SA JSON)
  const saPath = path.resolve(__dirname, '../../google-sa.json');
  if (fs.existsSync(saPath)) {
    try {
      console.log('[INDEX] Próba wysłania do Google Indexing API...');
      const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
      const token = await getGoogleAccessToken(sa);
      
      for (const url of urls) {
        const ok = await pushToGoogle(url, token);
        console.log(`[GOOGLE] ${ok ? 'OK' : 'FAIL'} - ${url}`);
        await new Promise(r => setTimeout(r, 1000)); // Rate limit safety
      }
    } catch (e) {
      console.error('[ERROR] Google Indexing failed:', e.message);
    }
  } else {
    console.log('[INFO] Pominąłem Google Indexing API (brak google-sa.json w katalogu głównym)');
  }
}

main();
