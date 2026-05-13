const fs = require('fs');
const path = require('path');
const { chat } = require('./lib/openrouter');
const { blogPostTemplate } = require('./lib/templates');

/**
 * GAJÓWKA AUTO-BLOG GENERATOR
 * Usage: node scripts/generate-blog.js "Topic of the post"
 */

async function generatePost(topic) {
  console.log(`[BLOG] Generowanie posta na temat: "${topic}"...`);

  const systemPrompt = `Jesteś ekspertem od turystyki na Mazurach i właścicielem luksusowej agroturystyki "Gajówka" w Węgorzewie. 
Twoim zadaniem jest napisać profesjonalny, pasjonujący i zoptymalizowany pod SEO artykuł na bloga.
Artykuł musi zachęcać do odwiedzenia Mazur, Węgorzewa i samej Gajówki.
Używaj języka korzyści, emocjonalnych opisów przyrody i praktycznych wskazówek.
Format: Artykuł musi być w formacie HTML (same tagi wewnątrz <div>, bez <html> i <body>). 
Używaj <h2> dla nagłówków sekcji, <p> dla akapitów, <ul> i <li> dla list.
Wstaw co najmniej jedno odniesienie do Gajówki jako idealnej bazy wypadowej.
Docelowa długość: 600-800 słów.`;

  const userPrompt = `Napisz artykuł na temat: ${topic}. 
Oprócz treści artykułu, na samym początku podaj w formacie JSON (wewnątrz bloku \`\`\`json):
{
  "title": "Przyciągający uwagę tytuł SEO",
  "description": "Meta opis zachęcający do kliknięcia (max 160 znaków)",
  "slug": "url-przyjazny-dla-google",
  "tags": ["tag1", "tag2"]
}
Następnie podaj treść artykułu w HTML.`;

  try {
    const result = await chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    const content = result.content;
    
    // Parse JSON metadata
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) throw new Error('Nie znaleziono metadanych JSON w odpowiedzi AI');
    
    const meta = JSON.parse(jsonMatch[1]);
    const htmlBody = content.replace(jsonMatch[0], '').trim();

    const date = new Date().toISOString().slice(0, 10);
    const finalHtml = blogPostTemplate({
      title: meta.title,
      description: meta.description,
      content: htmlBody,
      slug: meta.slug,
      date,
      tags: meta.tags
    });

    const blogDir = path.resolve(__dirname, '../blog');
    if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir);

    const filePath = path.join(blogDir, `${meta.slug}.html`);
    fs.writeFileSync(filePath, finalHtml);

    console.log(`[SUCCESS] Post wygenerowany i zapisany: blog/${meta.slug}.html`);
    
    // Update index (optional - could be automated further)
    updateBlogIndex(meta, date);

  } catch (e) {
    console.error('[ERROR]', e.message);
  }
}

function updateBlogIndex(meta, date) {
  // Simple append or re-generate logic could go here
  console.log(`[INFO] Pamiętaj, aby dodać link do ${meta.slug} w blog/index.html`);
}

// Check arguments
const topicArg = process.argv[2];
if (!topicArg) {
  console.log('Usage: node scripts/generate-blog.js "Temat posta"');
  process.exit(1);
}

generatePost(topicArg);
