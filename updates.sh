#!/bin/sh
rooturl=$(grep blogRss config.json | cut -f4 -d'"' | sed 's/\/feed.xml//g')
postdir=$(grep 'postSource' config.json | cut -f4 -d'"')
here=$(pwd)
month=$(date --date='9 days ago' +"%Y-%m")
cd "${postdir}"
hashes=$(git log --pretty='%ci %H' | grep "^${month}" | sed -n '1p;$p' | cut -c27- | paste -sd' ')
first=$(echo "${hashes}" | cut -f2 -d' ')
last=$(echo "${hashes}" | cut -f1 -d' ')
for file in $(git diff --name-only $first $last | grep -v "^${month}")
do
  target=$(basename $file .md | tr '-' '.')
  title=$(grep '^title: ' $file | cut -f2- -d':' | sed 's/^ *//g')
  url=$(grep "${target}" "${here}/blogurls.json" | cut -f4 -d'"')
  echo "[$title]($rooturl$url)"
done
cd "${here}"

