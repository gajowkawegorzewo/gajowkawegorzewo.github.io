/* Gajówka — współdzielona analityka + zgoda cookies (RODO/ePrivacy, Consent Mode v2)
   Jeden plik dla WSZYSTKICH stron (blog + główne). Idempotentny:
   - jeśli gtag już ustawiony inline (strona główna/de/en/v2) → NIE rusza go,
   - jeśli baner już jest w DOM → NIE wstrzykuje drugiego (tylko podpina konwersje).
   Dodatkowo: zdarzenia GA4 na klik w telefon i WhatsApp.                        */
(function () {
  var GA_ID = 'G-FV3WMT39RV';
  var KEY = 'gj_cookie_consent_v1';

  /* 1) GA4 + Consent Mode default DENY — tylko gdy strona nie ma już gtag (blog) */
  if (!window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('consent', 'default', {
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
      analytics_storage: 'denied', functionality_storage: 'granted',
      security_storage: 'granted', wait_for_update: 500
    });
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
    var gjs = document.createElement('script');
    gjs.async = true;
    gjs.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    (document.head || document.documentElement).appendChild(gjs);
  }

  function getStored() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function applyConsent(analytics) {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: analytics ? 'granted' : 'denied',
        ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
      });
    }
  }
  function setConsent(analytics) {
    try { localStorage.setItem(KEY, JSON.stringify({ state: { analytics: analytics }, ts: Date.now() })); } catch (e) {}
    applyConsent(analytics);
  }

  /* 2) Baner zgody — wstrzykiwany tylko gdy strona go nie ma (blog) */
  var CSS =
    '@keyframes cbIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}' +
    '.cookie-banner{position:fixed;left:16px;right:16px;bottom:16px;max-width:560px;margin:0 auto;background:#1e1a14;color:#fdfaf6;border:1px solid rgba(200,165,90,.35);border-radius:14px;padding:22px 26px;box-shadow:0 18px 50px rgba(0,0,0,.55);z-index:9999;font-family:"Lato",Arial,sans-serif;display:none;animation:cbIn .5s cubic-bezier(.22,1,.36,1)}' +
    '.cookie-banner.show{display:block}' +
    '.cookie-banner h4{font-family:"Playfair Display",Georgia,serif;font-size:17px;color:#c8a55a;margin:0 0 8px}' +
    '.cookie-banner p{font-size:13px;line-height:1.55;margin:0 0 14px;color:rgba(253,250,246,.85)}' +
    '.cookie-banner a{color:#c8a55a;text-decoration:underline}' +
    '.cookie-banner-actions{display:flex;gap:10px;flex-wrap:wrap}' +
    '.cookie-banner button{flex:1 1 auto;min-width:120px;padding:11px 14px;font-family:"Lato",Arial,sans-serif;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;border-radius:4px;cursor:pointer;border:1px solid transparent;transition:transform .2s,box-shadow .2s,background .2s}' +
    '.cookie-banner .cb-accept{background:#c8a55a;color:#1e1a14}' +
    '.cookie-banner .cb-accept:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(200,165,90,.35)}' +
    '.cookie-banner .cb-reject{background:transparent;color:#fdfaf6;border-color:rgba(253,250,246,.4)}' +
    '.cookie-banner .cb-reject:hover{background:rgba(253,250,246,.08);transform:translateY(-2px)}' +
    '.cookie-banner .cb-custom{background:transparent;color:#fdfaf6;border-color:rgba(253,250,246,.2);font-size:10px;flex-basis:100%;padding:9px}' +
    '.cookie-banner .cb-custom:hover{background:rgba(253,250,246,.05)}' +
    '.cookie-banner .cb-options{display:none;margin:14px 0;padding:14px;background:rgba(255,255,255,.04);border-radius:8px}' +
    '.cookie-banner .cb-options.open{display:block}' +
    '.cookie-banner .cb-options label{display:flex;align-items:center;gap:10px;font-size:13px;margin-bottom:8px;cursor:pointer}' +
    '.cookie-banner .cb-options label.disabled{opacity:.6;cursor:not-allowed}' +
    '.cookie-banner .cb-options input{width:16px;height:16px;cursor:pointer}' +
    '.cookie-banner .cb-options small{display:block;font-size:11px;color:rgba(253,250,246,.55);margin-left:26px;margin-top:-4px;margin-bottom:8px}' +
    '@media(max-width:480px){.cookie-banner{left:10px;right:10px;bottom:10px;padding:18px 20px}.cookie-banner-actions{flex-direction:column}.cookie-banner button{flex:1 1 100%}}';

  var LANG = (document.documentElement.lang || 'pl').slice(0, 2).toLowerCase();
  var T = {
    pl: { title: '🍪 Twoja prywatność',
      desc: 'Używamy plików cookies do działania strony oraz — za Twoją zgodą — do analizy ruchu (Google Analytics). Niezbędne cookies są zawsze aktywne. Szczegóły w <a href="/polityka-prywatnosci.html">Polityce prywatności</a>.',
      nec: 'Niezbędne', always: '(zawsze aktywne)', necd: 'Wymagane do podstawowych funkcji strony.',
      ana: 'Analityczne (Google Analytics)', anad: 'Pomagają nam zrozumieć jak goście korzystają ze strony. Dane zanonimizowane.',
      reject: 'Odrzuć opcjonalne', accept: 'Akceptuj wszystkie', custom: 'Dostosuj wybór', save: 'Zapisz wybór' },
    de: { title: '🍪 Ihre Privatsphäre',
      desc: 'Wir verwenden Cookies für den Betrieb der Website und — mit Ihrer Einwilligung — zur Reichweitenanalyse (Google Analytics). Notwendige Cookies sind immer aktiv. Details in der <a href="/polityka-prywatnosci.html">Datenschutzerklärung</a>.',
      nec: 'Notwendig', always: '(immer aktiv)', necd: 'Erforderlich für die Grundfunktionen der Website.',
      ana: 'Analyse (Google Analytics)', anad: 'Helfen uns zu verstehen, wie Gäste die Website nutzen. Anonymisierte Daten.',
      reject: 'Optionale ablehnen', accept: 'Alle akzeptieren', custom: 'Auswahl anpassen', save: 'Auswahl speichern' },
    en: { title: '🍪 Your privacy',
      desc: 'We use cookies to run the site and — with your consent — for traffic analysis (Google Analytics). Essential cookies are always on. Details in our <a href="/polityka-prywatnosci.html">Privacy Policy</a>.',
      nec: 'Essential', always: '(always on)', necd: 'Required for the basic functions of the site.',
      ana: 'Analytics (Google Analytics)', anad: 'Help us understand how guests use the site. Data is anonymised.',
      reject: 'Reject optional', accept: 'Accept all', custom: 'Customise', save: 'Save choice' }
  };
  var L = T[LANG] || T.pl;
  var HTML =
    '<div class="cookie-banner" id="cookie-banner" role="dialog" aria-labelledby="cb-title" aria-describedby="cb-desc">' +
    '<h4 id="cb-title">' + L.title + '</h4>' +
    '<p id="cb-desc">' + L.desc + '</p>' +
    '<div class="cb-options" id="cb-options">' +
    '<label class="disabled"><input type="checkbox" checked disabled> <span>' + L.nec + ' <small style="display:inline">' + L.always + '</small></span></label>' +
    '<small>' + L.necd + '</small>' +
    '<label><input type="checkbox" id="cb-analytics"> <span>' + L.ana + '</span></label>' +
    '<small>' + L.anad + '</small>' +
    '</div>' +
    '<div class="cookie-banner-actions">' +
    '<button class="cb-reject" onclick="window.cookieConsent.reject()">' + L.reject + '</button>' +
    '<button class="cb-accept" onclick="window.cookieConsent.acceptAll()">' + L.accept + '</button>' +
    '<button class="cb-custom" onclick="window.cookieConsent.toggleOptions()">' + L.custom + '</button>' +
    '</div></div>';

  function hideBanner() { var b = document.getElementById('cookie-banner'); if (b) b.classList.remove('show'); }
  function showBanner() {
    var b = document.getElementById('cookie-banner'); if (!b) return;
    var s = getStored(); var c = document.getElementById('cb-analytics');
    if (s && s.state && c) c.checked = !!s.state.analytics;
    b.classList.add('show');
  }

  function injectBanner() {
    if (document.getElementById('cookie-banner')) return false; // strona ma już swój baner (główna/de/en/v2)
    document.head.insertAdjacentHTML('beforeend', '<style>' + CSS + '</style>');
    document.body.insertAdjacentHTML('beforeend', HTML);
    window.cookieConsent = {
      acceptAll: function () { setConsent(true); hideBanner(); },
      reject: function () { setConsent(false); hideBanner(); },
      toggleOptions: function () {
        var opts = document.getElementById('cb-options'); if (!opts) return;
        opts.classList.toggle('open');
        var actions = document.querySelector('.cookie-banner-actions');
        if (opts.classList.contains('open') && !document.getElementById('cb-save-custom')) {
          var save = document.createElement('button');
          save.id = 'cb-save-custom'; save.className = 'cb-accept';
          save.style.flexBasis = '100%'; save.textContent = L.save;
          save.onclick = function () { setConsent(document.getElementById('cb-analytics').checked); hideBanner(); };
          actions.appendChild(save);
        }
      }
    };
    window.openCookieSettings = function () { showBanner(); };
    return true;
  }

  /* 3) Śledzenie konwersji — klik w telefon i WhatsApp (działa na każdej stronie) */
  function wireConversions() {
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var tel = t.closest('a[href^="tel:"]');
      if (tel && typeof gtag === 'function') {
        gtag('event', 'phone_click', {
          phone: (tel.getAttribute('href') || '').replace('tel:', ''),
          page_location: location.href, page_path: location.pathname
        });
      }
      var wa = t.closest('a[href*="wa.me"],a[href*="api.whatsapp.com"],a[href*="whatsapp://"]');
      if (wa && typeof gtag === 'function') {
        gtag('event', 'whatsapp_click', { page_location: location.href, page_path: location.pathname });
      }
    }, true);
  }

  function init() {
    var mine = injectBanner();           // wstrzyknie baner tylko na blogu
    var s = getStored();
    if (mine) {                          // logiką banera zarządzamy tylko gdy to NASZ baner
      if (!s) setTimeout(showBanner, 800);
      else if (s.state) applyConsent(!!s.state.analytics);
    }
    wireConversions();                   // konwersje zawsze
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
