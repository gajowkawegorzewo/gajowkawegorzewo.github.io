const { chat } = require('./openrouter');
const { generateSlug, savePost } = require('./utils');

/**
 * PROFESJONALNY GENERATOR BLOGA SEO (Multi-Agent)
 * 1. Strateg SEO - wybiera frazę i strukturę
 * 2. Researcher - dostarcza fakty o regionie
 * 3. Pisarz - tworzy treść wysokiej jakości
 * 4. Korektor - szlifuje i sprawdza fakty
 */

async function generateProPost(topicOrKeyword) {
  console.log(`[PRO-BLOG] Rozpoczynam profesjonalną produkcję dla: "${topicOrKeyword}"...`);

  // --- KROK 1: STRATEG SEO ---
  console.log(`[1/4] Strategowanie struktury pod frazy: noclegi mazury, atrakcje...`);
  const strategyPrompt = `Jesteś ekspertem SEO od turystyki na Mazurach. 
  Dla tematu "${topicOrKeyword}" przygotuj szczegółowy plan artykułu (nagłówki H2, H3).
  Cel: Ranking na frazy: noclegi mazury, atrakcje mazury, domek nad jeziorem.
  Artykuł musi być długi, ekspercki i zawierać sekcję FAQ.
  Zwróć plan w punktach.`;
  
  const strategy = await chat([{ role: 'user', content: strategyPrompt }]);

  // --- KROK 2: RESEARCHER ---
  console.log(`[2/4] Zbieranie faktów o regionie Węgorzewa i okolic...`);
  const factsPrompt = `Jesteś przewodnikiem turystycznym po Węgorzewie i Mazurach Północnych.
  Dla powyższego planu dostarcz konkretne fakty, nazwy miejsc, odległości od Gajówki (Kamień/Surwile), legendy i praktyczne wskazówki (np. kiedy najlepiej zwiedzać Mamerki). 
  Plan: ${strategy.content}`;
  
  const facts = await chat([{ role: 'user', content: factsPrompt }]);

  // --- KROK 3: PISARZ (GŁÓWNA TREŚĆ) ---
  console.log(`[3/4] Pisanie artykułu (High Quality Content)...`);
  const writerPrompt = `Jesteś profesjonalnym copywriterem i pasjonatem Mazur, właścicielem Gajówki.
  Napisz artykuł na podstawie planu i faktów. 
  STYL: Naturalny, angażujący, ekspercki. ŻADNEGO "AI-generated trash". 
  Długość: minimum 800-1000 słów.
  Używaj HTML (p, h2, h3, ul, strong).
  Wpleć naturalnie frazy: noclegi mazury, domek nad jeziorem, atrakcje mazury.
  PLAN: ${strategy.content}
  FAKTY: ${facts.content}`;
  
  const draft = await chat([{ role: 'user', content: writerPrompt }], { max_tokens: 4000 });

  // --- KROK 4: KOREKTOR ---
  console.log(`[4/4] Ostateczna korekta i weryfikacja merytoryczna...`);
  const editorPrompt = `Jesteś redaktorem naczelnym portalu turystycznego. 
  Przejrzyj poniższy artykuł. Usuń wszelkie "lanie wody", popraw błędy, upewnij się, że tekst brzmi jak napisany przez człowieka.
  Zwróć gotowy kod HTML (tylko środek artykułu, bez <html>).
  TEKST: ${draft.content}`;
  
  const finalContent = await chat([{ role: 'user', content: editorPrompt }], { max_tokens: 4000 });

  // Zapisywanie
  const slug = generateSlug(topicOrKeyword);
  const title = topicOrKeyword; // Można wyciągnąć lepszy tytuł z AI
  
  await savePost(slug, {
    title,
    content: finalContent.content,
    excerpt: draft.content.substring(0, 160).replace(/<[^>]*>/g, '') + '...',
    date: new Date().toISOString().split('T')[0],
    category: 'Przewodnik'
  });

  return { slug, title };
}

module.exports = { generateProPost };
