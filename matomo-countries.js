const axios = require('axios');
const fs = require('fs');

const dateTimeFormat = new Intl.DateTimeFormat(
  'en',
  { year: 'numeric', month: 'short', day: '2-digit' }
);
const config = JSON.parse(fs.readFileSync('./config.json'));
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

axios({
  headers: {
  },
  method: 'GET',
  url: `${config.matomo.url}/index.php?module=API&method=Live.getLastVisitsDetails&idSite=${config.matomo.site}&period=month&date=${date}&format=JSON&token_auth=${config.matomo.token_auth}`,
}).then((result) => {
  const countries = {};
  const visits = result.data;

  visits
    .map((v) => v.country)
    .forEach((c) => {
      if (Object.prototype.hasOwnProperty.call(countries, c)) {
        countries[c] = countries[c] + 1;
      } else {
        countries[c] = 1;
      }
    });
  let unique = Object.keys(countries).sort().join(', ');
  const lastComma = unique.lastIndexOf(',');
  unique = unique.slice(0, lastComma + 2) +
    'and ' +
    unique.slice(lastComma + 2);
  console.log(unique);
}).catch((e) => {
  console.log(e);
});

