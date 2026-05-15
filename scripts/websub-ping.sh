#!/usr/bin/env bash
# WebSub (PubSubHubbub) ping — informuje hub Google'a że feed.xml zmienił się.
# Hub robi fan-out do wszystkich subskrybentów (Google Reader/Feedfetcher,
# inne usługi RSS). W praktyce: nowy blog widziany przez Google w sekundach,
# nie godzinach.
#
# Usage: bash scripts/websub-ping.sh
# Sukces: HTTP 204 (No Content) lub 200.
# Klucz/auth NIE jest potrzebny — to publiczny hub.

set -euo pipefail

HUB="https://pubsubhubbub.appspot.com/publish"
FEED_URL="https://gajowkawegorzewo.github.io/feed.xml"

echo "WebSub ping: hub=${HUB}"
echo "  feed=${FEED_URL}"

http_code=$(curl -sS -o /tmp/websub-response -w "%{http_code}" \
  -X POST "${HUB}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "hub.mode=publish" \
  --data-urlencode "hub.url=${FEED_URL}" \
  --max-time 30)

echo ""
echo "HTTP ${http_code}"
echo "Response:"
cat /tmp/websub-response 2>/dev/null || true
echo ""

# Kody sukcesu:
#   204 No Content — przyjęte (typowe dla pubsubhubbub.appspot.com)
#   200 OK — przyjęte
#   400 — błąd payload (niepoprawne hub.mode / hub.url)
#   422 — feed nie istnieje / nie jest poprawny RSS
case "$http_code" in
  200|204) echo "Sukces — hub zostal powiadomiony (subskrybenci dostana push)" ; exit 0 ;;
  *) echo "Blad — sprawdz response wyzej" ; exit 1 ;;
esac
