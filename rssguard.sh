#!/bin/sh

# SPDX-FileCopyrightText: 2023 John Colagioia <john@colagioia.net>
#
# SPDX-License-Identifier: AGPL-3.0-or-later

db=$(jq -r '.rssGuard.dbPath' config.json)
first=$(date +'%Y-%m-01')
start=$(date -d "$first -1 month" +'%s')
end=$(date -d "$first -1 second" +'%s')
sqlite3 "${db}" "SELECT m.title, m.url, f.title FROM Messages m INNER JOIN Feeds f ON m.feed = f.id WHERE is_important = 1 AND m.date_created > ${start}000 AND m.date_created < ${end}000 ORDER BY m.date_created;" | while read -r row
do
  title=$(echo "${row}" | cut -f1 -d'|')
  url=$(echo "${row}" | cut -f2 -d'|' | cut -f1 -d'?')
  feed=$(echo "${row}" | cut -f3 -d'|')
  echo "* [${title}](${url}) from ${feed}"
done

