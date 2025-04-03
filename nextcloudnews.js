const axios = require('axios');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json'));

// Just a utility function to GET from the default URL.
// * postData: A JavaScript object with the data to be sent.
async function get(endpoint, postData) {
  const params = new URLSearchParams(postData);

  return await axios({
    headers: {
      'Authorization': 'Basic ' + btoa(`${config.nextcloudnews.user}:${config.nextcloudnews.password}`),
    },
    method: 'GET',
    url: `${config.nextcloudnews.url}${endpoint}?${params.toString()}`,
  });
}

// A function to iterate through starred articles to find
// everything saved in the specified month.
// * mmyy: The month to search for as a JavaScript date
// If mmyy is not supplied, the code will assume the current
// month UNLESS the current month is new, in which case it
// uses last month, instead.
async function getPostsForMonth(mmyy = null) {
  const batch = config.nextcloudnews.batch;
  let results = [];
  let date = mmyy;
  let postsInBatch = 0;
  let offset = 0;

  // We weren't given a target date, so figure it out based
  // on the current date.

  if (mmyy === null) {
    const now = new Date();
    const mNow = now.getMonth();
    const dNow = now.getDate();

    date = now;
    if (dNow < 10) {
      // If it's early in the month, we mean last month.
      date.setMonth(mNow - 1);
    }
  }

  do {
    // Get a batch of starred posts.
    const response = await get('items', {
      "batchSize": batch,
      "getRead": true,
      "type": 2, // These are starred articles.
    });
    // Discard any posts that aren't from the target month.
    const inMonth = response.data.items.filter((p) => {
      const postDate = new Date(p.pubDate * 1000);

      return postDate.getYear() === date.getYear() &&
        postDate.getMonth() === date.getMonth();
    });
    results = results.concat(inMonth);
    // set up to get the next batch
    // If we don't have any posts in this batch, then
    // we're done.
    postsInBatch = response.data.items.length;
    offset += batch;
  } while (postsInBatch === batch);
  return results;
}

function getFeed(feeds, id) {
  return feeds.filter((f) => f.id === id)[0];
}

// The main program, written as a function, so that we can
// await the axios() calls instead of building an asynchronous
// nightmare.
async function main() {
  let response = await get('feeds', {});

  feeds = response.data.feeds;
  response = await getPostsForMonth();

  const html = response
    .map((p) => `* [${p.title}](${p.url}) from ${getFeed(feeds, p.feedId).title}`)
    .join('\n');
  console.log(html);
}

main();

