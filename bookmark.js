const sqlite3 = require('better-sqlite3');
const fs = require('fs');
const ini = require('ini');
const path = require('path');

const config = JSON.parse(fs.readFileSync('./config.json'));
const dbName = 'places.sqlite';
const homedir = require('os').homedir();
const firefoxPath = path.join(homedir, '.mozilla', 'firefox');
const firefoxConfigPath = path.join(firefoxPath, 'profiles.ini');
const ffIni = fs.readFileSync(firefoxConfigPath, 'utf-8');
const ffConfig = ini.parse(ffIni);
const bookmarkPath = path.join(config.firefox.dbPath, dbName);

// If we don't copy the file somewhere local, we'll run afoul of locking, if
// someone is using the browser.
fs.copyFileSync(bookmarkPath, dbName);

const db = new sqlite3(dbName, {
  verbose: null,
});
const select = db.prepare(
  'SELECT b.title,b.lastModified,p.url FROM moz_bookmarks b JOIN moz_places p ON b.fk = p.id;'
);
const rows = select.all();
const month = [];

const now = new Date();

db.close();

if (now.getDate() < 10) {
  // If it's early in the month, we mean last month.
  now.setMonth(now.getMonth() - 1);
}

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  // Beware Firefox's wonderful new twist on UNIX timestamps: nanoseconds
  // that are always zero and also incompatible with everything else.
  const date = new Date(row.lastModified / 1000);

  if (date.getYear() === now.getYear() && date.getMonth() === now.getMonth()) {
    row.lastModified = date;
    month.push (row);
  }
}

// Turn the data set into Markdown.
const result = month
  .reverse()
  .map((r) => ` * [${r.title}](${r.url})`)
  .join('\n');

console.log(result);
// Delete the copied database, since we don't need it.
fs.unlinkSync(dbName);

