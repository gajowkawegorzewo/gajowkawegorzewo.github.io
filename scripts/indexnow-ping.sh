#!/usr/bin/env bash
# IndexNow ping — push nowych URL do Bing/Yandex/Seznam
# Usage:
#   ./scripts/indexnow-ping.sh URL1 [URL2 URL3 ...]
# albo:
#   ./scripts/indexnow-ping.sh < list.txt   (jeden URL per linia)
#
# Limit per request: 10 000 URL. Limit dzienny per host: brak (Bing pozwala).
#
# Klucz publiczny widoczny na https://gajowkawegorzewo.pl/825546c92685bdd377ae341979800263.txt
# To bezpieczne: klucz nie daje nikomu uprawnień, jest tylko dowodem własności domeny.

set -euo pipefail

HOST="gajowkawegorzewo.pl"
KEY="825546c92685bdd377ae341979800263"
KEY_LOCATION="https://${HOST}/${KEY}.txt"
ENDPOINT="https://api.indexnow.org/IndexNow"

# Zbierz URL-e z argumentów albo stdin
urls=()
if [ "$#" -gt 0 ]; then
  urls=("$@")
else
  while IFS= read -r line; do
    [ -n "$line" ] && urls+=("$line")
  done
fi

if [ "${#urls[@]}" -eq 0 ]; then
  echo "Brak URL-i. Usage: $0 URL1 [URL2 ...]" >&2
  exit 1
fi

# Buduj JSON urlList
url_json=""
for u in "${urls[@]}"; do
  if [ -n "$url_json" ]; then
    url_json="${url_json},"
  fi
  url_json="${url_json}\"${u}\""
done

payload="{\"host\":\"${HOST}\",\"key\":\"${KEY}\",\"keyLocation\":\"${KEY_LOCATION}\",\"urlList\":[${url_json}]}"

echo "Wysyłanie ${#urls[@]} URL do IndexNow (api.indexnow.org)..."
echo "Payload: ${payload}"

http_code=$(curl -sS -o /tmp/indexnow-response -w "%{http_code}" \
  -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json; charset=utf-8" \
  -H "Host: api.indexnow.org" \
  -d "${payload}" \
  --max-time 30)

echo ""
echo "HTTP ${http_code}"
echo "Response:"
cat /tmp/indexnow-response 2>/dev/null || true
echo ""

# Kody sukcesu IndexNow:
#   200 OK — przyjęte
#   202 Accepted — przyjęte, w kolejce (najczęstsze)
#   400 — błąd payload (np. URL nie na hoście)
#   403 — klucz nie znaleziony pod keyLocation (problem z deploy)
#   422 — URL nie pasuje do host
#   429 — za dużo requestów
case "$http_code" in
  200|202) echo "✓ Sukces — Bing/Yandex/Seznam zostały powiadomione" ; exit 0 ;;
  *) echo "✗ Błąd — sprawdź response wyżej" ; exit 1 ;;
esac
