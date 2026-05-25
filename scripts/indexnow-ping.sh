#!/bin/bash
# IndexNow: notify Bing/Yandex/Naver/Seznam about URL changes for instant indexing.
# Run after deploys that add or significantly change URLs.
#
# Usage:
#   bash scripts/indexnow-ping.sh                  → pings all known URLs
#   bash scripts/indexnow-ping.sh url1 url2 ...   → pings specific URLs
set -e

KEY="74f3c81fe77cba29a9f400886ad9b7fd"
HOST="www.primeoutdoorexperts.com"
KEY_LOCATION="https://${HOST}/${KEY}.txt"

if [ "$#" -gt 0 ]; then
  URLS=("$@")
else
  # Default: ping the 10 currently-unindexed pages + homepage as anchor
  URLS=(
    "https://${HOST}/"
    "https://${HOST}/blog/best-grass-types-orlando-florida/"
    "https://${HOST}/blog/how-much-does-commercial-landscaping-cost-orlando/"
    "https://${HOST}/blog/hoa-landscaping-orlando-what-to-expect/"
    "https://${HOST}/commercial-landscaping/apartment-complexes/"
    "https://${HOST}/commercial-landscaping/hospitality-hotels/"
    "https://${HOST}/commercial-landscaping/office-parks/"
    "https://${HOST}/commercial-landscaping/retail-centers/"
    "https://${HOST}/locations/altamonte-springs-fl/"
    "https://${HOST}/locations/apopka-fl/"
    "https://${HOST}/locations/kissimmee-fl/"
    "https://${HOST}/locations/maitland-fl/"
  )
fi

# Build JSON body
URL_LIST=$(printf '"%s",' "${URLS[@]}")
URL_LIST="${URL_LIST%,}"

JSON="{\"host\":\"${HOST}\",\"key\":\"${KEY}\",\"keyLocation\":\"${KEY_LOCATION}\",\"urlList\":[${URL_LIST}]}"

echo "Pinging IndexNow with ${#URLS[@]} URLs..."
curl -sS -X POST "https://api.indexnow.org/IndexNow" \
  -H "Content-Type: application/json" \
  -d "$JSON" \
  -w "\nHTTP: %{http_code}\n"
echo
echo "Expected response: HTTP 200 or 202 (success)"
