#!/bin/sh
rooturl=$(jq -r '.blogRss' < config.json | sed 's/\/feed.xml//g')
postdir=$(jq -r '.postSource' < config.json)
here=$(pwd)
month=$(date --date='9 days ago' +"%Y-%m")
cd "${postdir}" || exit
hashes=$( \
  git log --pretty='%ci %H' | \
  grep "^${month}" | \
  sed -n '1p;$p' | \
  cut -c27- | \
  paste -sd' ' \
)
first=$(echo "${hashes}" | cut -f2 -d' ')
last=$(echo "${hashes}" | cut -f1 -d' ')
for file in $(git diff --name-only "$first" "$last" | grep -v "^${month}")
do
  words=words
  changes=$( \
    git diff --word-diff=porcelain "${first}^1" "${last}" -- "$file" | \
    grep '^[+-][^+-]' | \
    wc -w \
  )
  if [ "$changes" -eq 1 ]
  then
    words=word
  fi
  target=$(basename "$file" .md | tr '-' '.')
  title=$(grep '^title: ' "$file" | cut -f2- -d':' | sed 's/^ *//g')
  postdate=$(grep '^date: ' "$file" | cut -f2- -d':')
  published=$(date --date="${postdate}" +"%A, %Y %B %d")
  url=$(grep "${target}" "${here}/blogurls.json" | cut -f4 -d'"')
  echo " * [${title}](${rooturl}${url}) from ${published}, ${changes} ${words}"
done
cd "${here}" || exit

