const axios = require('axios');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const fedi = fs
  .readFileSync('./fedi.csv', 'utf-8')
  .trim()
  .split('\n')
  .map((l) => l.trim().split(','))
  .map((l) => ({
    domain: l[0],
    id: l[1],
    name: l[2],
  }));

// Just a utility function to GET from the default URL.
// * postData: A JavaScript object with the data to be sent.
async function get(endpoint, postData, auth) {
  const params = new URLSearchParams(postData);

  return await axios({
    headers: {
      'Authorization': 'GoogleLogin auth=' + auth,
    },
    method: 'GET',
    url: `${config.freshrss.url}${endpoint}?${params.toString()}`,
  });
}

// A function to iterate through starred articles to find
// everything saved in the specified month.
// * mmyy: The month to search for as a JavaScript date
// If mmyy is not supplied, the code will assume the current
// month UNLESS the current month is new, in which case it
// uses last month, instead.
async function getPostsForWeek(auth, mmyy = null) {
  const batch = config.freshrss.batch;
  let results = [];
  let date = mmyy;
  let monday;
  let friday;
  let continuation;

  // We weren't given a target date, so figure it out based
  // on the current date.
  if (mmyy === null) {
    const now = new Date();
    const dayOfWeek = now.getDay();

    monday = new Date(now);
    monday.setDate(monday.getDate() - (dayOfWeek + 6) % 7);
    monday.setHours(0,0,0,0);

    friday = new Date(now);
    friday.setDate(friday.getDate() - (dayOfWeek + 2) % 7);
    friday.setHours(23, 59, 59, 999);
  }

  do {
    // Get a batch of starred posts.
    const response = await get('/reader/api/0/stream/contents/user/-/state/com.google/starred', {
      "c": continuation,
      "n": batch,
      "output": "json",
    }, auth);

    // Discard any posts that aren't from the current week.
    const inMonth = response.data.items.filter((p) => {
      const postDate = new Date(p.published * 1000);

      return postDate > monday && postDate < friday;
    });
    results = results.concat(inMonth);
    // set up to get the next batch
    // If we don't have any posts in this batch, then
    // we're done.
    continuation = response.data.continuation;
  } while (continuation);
  return results;
}

function linkFromRss(rss) {
  let title = rss.title;
  let href = rss.canonical[0].href.split('?')[0];
  let from = rss.origin.title;

  for (let i = 0; i < fedi.length; i++) {
    const source = fedi[i];

    if (href.indexOf(source.domain) >= 0) {
      from = `${source.name} ${source.id}`;
    }
  }

  return `[${title}](${href}) from ${from}`
}

// The main program, written as a function, so that we can
// await the axios() calls instead of building an asynchronous
// nightmare.
async function main() {
  let response = await get('/accounts/ClientLogin', {
    "Email": config.freshrss.user,
    "Passwd": config.freshrss.password,
  });
  const auth = new URLSearchParams(response.data.split('\n').join('&'));

  response = await getPostsForWeek(auth.get('Auth'));

  const md = response
    .map((p) => linkFromRss(p))
    .reverse()
    .join('\n');

  console.log(md);
}

main();

