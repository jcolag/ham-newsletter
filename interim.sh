#!/bin/bash
markdown=$(mktemp --suffix=.md)
html=$(mktemp --suffix=.html)
introFolder=$(jq -r '.introFolder' < config.json)
halt=$(jq -r '.general.halt' < config.json)
idle="${introFolder}/$(date +"%Y")/$(date +"%Y-%m").md"

if grep -iqw "${halt}" "${idle}"
then
  echo "\e[3m${idle}\e[0m still includes \e[1m${halt}\e[0m."
  echo Exiting...
  exit 0
fi

# Convert the markdown to HTML, with any styling we want to add stored
# in style.css.
pandoc --from=markdown \
       --to=html \
       --output="${html}" \
       --standalone \
       --table-of-contents \
       --include-in-header=style.css \
       --embed-resources \
       --standalone \
       --section-divs \
       --metadata pagetitle="For&nbsp;E-Mail" \
       "${idle}"

# Open the HTML in Firefox for copying elsewhere.
firefox "${html}"

