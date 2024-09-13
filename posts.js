const fs = require('fs');
const https = require('https');
const xml = require('xml2js');

const config = JSON.parse(fs.readFileSync('./config.json'));
let rss = '';

https.get(config.blogRss, (res) => {
  res.on('data', (d) => {
    // Just aggregate the returned content.
    rss += d.toString();
  });
  res.on('end', () => {
    const feed = xml.parseString(rss, (err, res) => {
      const entries = res.feed.entry;
      let table = [];

      for (let i = 0; i < entries.length; i++) {
        // Each entry element of the RSS is a post, so extract
        // what we need and turn it into Markdown.
        const entry = entries[i];
        const title = entry.link[0]['$'].title;
        const url = entry.link[0]['$'].href;
        let summary = 'No summary found.';
        const published = new Date(entry.published[0]);
        const now = new Date();

        if (Object.prototype.hasOwnProperty.call(entry, 'summary')) {
          const summary = entry.summary[0]._;
        }

        if (now.getDate() < 10) {
          // If it's early in the month, we mean last month.
          now.setMonth(now.getMonth() - 1);
        }

        if (
          now.getYear() === published.getYear() &&
          now.getMonth() === published.getMonth()
        ) {
          table.push(` * [${title}](${url}) - ${published.toDateString()}`);
        }
      }

      const result = table.join('\n');
      console.log(result);
    });
  });
  res.on('error', (e) => {
    console.log(e);
  });
});

