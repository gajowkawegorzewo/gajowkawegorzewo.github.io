const { chat } = require('./lib/openrouter');
const { sendEmail } = require('./lib/mailer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
try { require('dotenv').config(); } catch (e) {}

/**
 * DAILY BLOG ORCHESTRATOR
 * 1. Wybiera temat (AI)
 * 2. Generuje post
 * 3. Indeksuje w Google/Bing
 * 4. Wysyła raport email
 */

async function runDaily() {
  console.log('--- START DAILY BLOG TASK ---');
  let log = [];
  const pushLog = (msg) => { console.log(msg); log.push(msg); };

  try {
    // 1. Wybierz temat
    pushLog('[1] Wybieranie tematu przez AI...');
    const topicResult = await chat([
      { role: 'system', content: 'Jesteś redaktorem bloga agroturystyki Gajówka na Mazurach. Wymyśl jeden konkretny, ciekawy temat na wpis blogowy, który przyciągnie turystów w 2026 roku. Temat powinien dotyczyć atrakcji, przyrody, jedzenia lub relaksu w okolicach Węgorzewa. Podaj tylko sam tytuł.' }
    ]);
    const topic = topicResult.content.trim().replace(/"/g, '');
    pushLog(`[1] Wybrany temat: ${topic}`);

    // 2. Wygeneruj post (używając istniejącego skryptu)
    pushLog('[2] Generowanie treści posta...');
    // Przechwytujemy output z generate-blog.js
    const genOutput = execSync(`node scripts/generate-blog.js "${topic}"`).toString();
    pushLog(genOutput);

    // Znajdź slug z outputu
    const slugMatch = genOutput.match(/blog\/(.+)\.html/);
    const slug = slugMatch ? slugMatch[1] : null;
    const url = slug ? `https://gajowkawegorzewo.github.io/blog/${slug}.html` : null;

    // 3. Odśwież Sitemap
    pushLog('[3] Odświeżanie sitemap.xml...');
    execSync('node scripts/generate-sitemap.js');

    // 4. Indeksowanie
    if (url) {
      pushLog(`[4] Indeksowanie URL: ${url}`);
      try {
        const indexOutput = execSync(`node scripts/index-push.js ${url}`).toString();
        pushLog(indexOutput);
      } catch (e) {
        pushLog(`[4] Błąd indeksowania: ${e.message}`);
      }
    } else {
      pushLog('[4] Pominąłem indeksowanie - nie znaleziono URL.');
    }

    // 5. Raport Email
    const reportEmail = process.env.REPORT_EMAIL || 'michalwor@gmail.com';
    pushLog(`[5] Wysyłanie raportu na ${reportEmail}...`);
    
    const subject = `Gajówka Blog Report: ${new Date().toLocaleDateString()}`;
    const html = `
      <h2>Raport z automatycznego generowania bloga</h2>
      <p><strong>Data:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Temat dnia:</strong> ${topic}</p>
      <p><strong>Status:</strong> Sukces</p>
      ${url ? `<p><strong>Link:</strong> <a href="${url}">${url}</a></p>` : ''}
      <hr>
      <h3>Logi systemowe:</h3>
      <pre style="background:#f4f4f4;padding:10px;font-size:12px;">${log.join('\n')}</pre>
    `;

    await sendEmail({
      to: reportEmail,
      subject,
      html,
      text: log.join('\n')
    });

  } catch (e) {
    pushLog(`[FATAL ERROR] ${e.message}`);
    // Wyślij raport o błędzie
    const reportEmail = process.env.REPORT_EMAIL || 'michalwor@gmail.com';
    await sendEmail({
      to: reportEmail,
      subject: `BŁĄD: Gajówka Blog Report ${new Date().toLocaleDateString()}`,
      html: `<h2>Wystąpił błąd podczas generowania bloga</h2><pre>${e.stack}</pre>`,
      text: e.stack
    }).catch(() => {});
  }
}

runDaily();
