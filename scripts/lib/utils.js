const fs = require('fs');
const path = require('path');
const { blogTemplate } = require('./templates');

function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Zastąp spacje myślnikami
    .replace(/[^\w\-]+/g, '')       // Usuń znaki niebędące słowami
    .replace(/\-\-+/g, '-');        // Usuń wielokrotne myślniki
}

async function savePost(slug, data) {
  const blogDir = path.resolve(__dirname, '../../blog');
  if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });

  const fileName = `${slug}.html`;
  const filePath = path.join(blogDir, fileName);

  // Używamy szablonu do wygenerowania pełnego HTML
  const html = blogTemplate(data);
  
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`[UTILS] Zapisano post: ${fileName}`);
  
  // Opcjonalnie: zaktualizuj listę postów w index.html (do zrobienia w przyszłości)
  return filePath;
}

module.exports = { generateSlug, savePost };
