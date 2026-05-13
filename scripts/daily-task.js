require('dotenv').config();
const { generateProPost } = require('./lib/generator-pro');
const { generateSitemap } = require('./generate-sitemap');
const { pushToIndexers } = require('./index-push');

async function runDaily() {
  console.log('--- START DAILY TASK (PRO MODE) ---');
  
  try {
    // 0. Sprawdzenie limitu (max 2 na dobę)
    const fs = require('fs');
    const path = require('path');
    const blogDir = path.resolve(__dirname, '../blog');
    const today = new Date().toISOString().split('T')[0];
    
    if (fs.existsSync(blogDir)) {
      const todayPosts = fs.readdirSync(blogDir)
        .filter(f => f.endsWith('.html'))
        .map(f => fs.readFileSync(path.join(blogDir, f), 'utf8'))
        .filter(html => html.includes(`datetime="${today}"`) || html.includes(`>${today}<`))
        .length;
        
      if (todayPosts >= 2) {
        console.log(`[LIMIT] Dzisiaj opublikowano już ${todayPosts} posty. Przerywam, aby nie spamować.`);
        return;
      }
    }
    // 1. Wybór tematu SEO (noclegi, atrakcje, domek nad jeziorem)
    const keywords = [
      "Atrakcje Mazur 2026: Kompletny przewodnik po Węgorzewie i okolicy",
      "Gdzie spać na Mazurach? Porównanie noclegów i dlaczego domek nad jeziorem to najlepszy wybór",
      "Weekend na Mazurach: Plan zwiedzania i najlepsze noclegi blisko natury",
      "Najlepsze domki nad jeziorem na Mazurach - na co zwrócić uwagę przy rezerwacji",
      "Węgorzewo: Ukryte perły i atrakcje Mazur Północnych"
    ];
    
    // Wybieramy temat (można zautomatyzować wybór przez AI, tu bierzemy losowy z listy SEO)
    const topic = keywords[Math.floor(Math.random() * keywords.length)];
    
    // 2. Profesjonalna generacja
    const post = await generateProPost(topic);
    console.log(`[OK] Wygenerowano post: ${post.title}`);
    
    const postUrl = `https://gajowkawegorzewo.github.io/blog/${post.slug}.html`;
    
    // 3. Odświeżenie sitemapy
    await generateSitemap();
    console.log('[OK] Sitemap zaktualizowana.');
    
    // 4. Indeksowanie (Google/Bing)
    await pushToIndexers([postUrl]);
    console.log('[OK] Zgłoszono do wyszukiwarek.');

    console.log('--- DAILY TASK COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('!!! DAILY TASK FAILED !!!');
    console.error(err);
  }
}

runDaily();
