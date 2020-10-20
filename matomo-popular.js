const axios = require('axios');
const fs = require('fs');

const dateTimeFormat = new Intl.DateTimeFormat(
  'en',
  { year: 'numeric', month: 'short', day: '2-digit' }
);
const config = JSON.parse(fs.readFileSync('./config.json'));
const urls = JSON.parse(fs.readFileSync('./blogurls.json'));
const now = new Date();

if (now.getDate() < 10) {
  // If it's early in the month, we mean last month.
  now.setMonth(now.getMonth() - 1);
}

const [
  { value: month },
  ,
  { value: day },
  ,
  { value: year },
] = dateTimeFormat.formatToParts(now);
const date = `${year}-${month}-${day}`;
const lastSlash = config.blogRss.lastIndexOf('/');
const blogPath = config.blogRss.slice(0, lastSlash);

axios({
  headers: {
  },
  method: 'GET',
  url: `${config.matomo.url}/index.php?module=API&method=Actions.getPageTitles&idSite=${config.matomo.site}&period=month&date=today&format=JSON&token_auth=${config.matomo.token_auth}`,
}).then((result) => {
  const countries = {};
  const visits = result.data;
  let sanitized = visits
    .filter((v) => v.label.indexOf(' Posts |') !== 0)
    .map((v) => ({
      hits: v.nb_hits,
      title: v.label.replace(' | Entropy Arbitrage', '').trim(),
      url: urls[
        v.label.replace(' | Entropy Arbitrage', '').trim().replace('’', "'")
      ],
      visits: v.nb_visits,
    }))
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 4)
    .map((v) => `[*${v.title}*](${blogPath}${v.url})`)
    .join(', ');
  const idx = sanitized.lastIndexOf('),') + 2;

  sanitized = sanitized.slice(0, idx) +
    ' and' +
    sanitized.slice(idx);
  console.log(sanitized);
});

