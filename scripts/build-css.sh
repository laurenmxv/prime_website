#!/bin/bash
# Concatenate the 3 source stylesheets into single bundle
set -e
cd "$(dirname "$0")/.."
echo "Building css/site.css..."
cat css/styles.css css/botanical-premium.css css/florida-heat.css > css/site.css
echo "  $(wc -c < css/site.css) bytes"
