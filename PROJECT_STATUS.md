# Status Projektu: Gajówka Węgorzewo (Automatyzacja SEO)

Oto podsumowanie zmian, wdrożonych systemów oraz instrukcja obsługi dla kolejnych programistów lub administratorów.

## 🛠️ Wdrożone Systemy

### 1. Automatyczny System Blogowy (`/scripts/`)
*   **`daily-task.js`**: Główny orkiestrator. Wybiera temat przez AI, generuje wpis, odświeża sitemapę i wysyła raport e-mail.
*   **`generate-blog.js`**: Silnik generujący artykuły HTML na podstawie szablonów (`lib/templates.js`).
*   **`index-push.js`**: Skrypt zgłaszający nowe URL-e do Google (Indexing API) oraz Bing (IndexNow).
*   **`generate-sitemap.js`**: Automatycznie buduje `sitemap.xml` na podstawie plików w `/blog/`.

### 2. Konfiguracja AI (OpenRouter)
Używamy **wyłącznie darmowych modeli** w systemie fallback:
1. `Gemini 2.0 Flash (Free)`
2. `Llama 3.1 8B (Free)`
3. `Mistral 7B (Free)`
4. `Auto Free Router` (automatyczny wybór najlepszego darmowego modelu)

---

## 🔍 Google Search Console (GSC) - Rozwiązanie problemu
Jeśli podczas dodawania adresu e-mail z `google-sa.json` do GSC pojawia się błąd **"Nie znaleziono adresu e-mail"**:

1.  **Przyczyna**: Jest to powszechny błąd Google (maj 2026) w nowym interfejsie GSC.
2.  **ROZWIĄZANIE (Obejście)**:
    *   W GSC wejdź w: **Ustawienia** > **Weryfikacja własności**.
    *   Kliknij link **"Właściciele usług"** na samym dole (otworzy się stary interfejs Webmaster Tools).
    *   Kliknij przycisk **"Dodaj właściciela"**.
    *   Wklej e-mail konta usługi: `gajowka-blog-indexer@...iam.gserviceaccount.com`.
    *   Zatwierdź. To powinno zadziałać bez błędów.

---

## 📝 Lista Ostatnich Zmian
- ✅ **Mapa**: Poprawiono lokalizację Gajówki na precyzyjne współrzędne `54.1974653, 21.5967396`.
- ✅ **Dojazd**: Przeniesiono opis trasy przez las bezpośrednio pod mapę (poprawiono czytelność).
- ✅ **Blog**: Usunięto nieaktualną "Majówkę". Dodano artykuły: "Lato 2026 na Mazurach" oraz "Atrakcje Węgorzewa".
- ✅ **SEO**: Wdrożono automatyczny generator `sitemap.xml`.
- ✅ **Bezpieczeństwo**: Dodano `.gitignore` chroniący klucze `.env` i `google-sa.json`.

## 🚀 Jak uruchomić generator?
W terminalu wpisz:
```powershell
node scripts/daily-task.js
```

---
*Ostatnia aktualizacja: 13 maja 2026*
