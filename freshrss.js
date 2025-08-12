const axios = require('axios');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json'));

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
async function getPostsForMonth(auth, mmyy = null) {
  const batch = config.freshrss.batch;
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
    const response = await get('/reader/api/0/stream/contents/user/-/state/com.google/starred', {
      "c": continuation,
      "n": batch,
      "output": "json",
    }, auth);

    // Discard any posts that aren't from the target month.
    const inMonth = response.data.items.filter((p) => {
      const postDate = new Date(p.published * 1000);

      return postDate.getYear() === date.getYear() &&
        postDate.getMonth() === date.getMonth();
    });
    results = results.concat(inMonth);
    // set up to get the next batch
    // If we don't have any posts in this batch, then
    // we're done.
    continuation = response.data.continuation;
  } while (continuation);
  return results;
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

  response = await getPostsForMonth(auth.get('Auth'));

  const md = response
    .map((p) => `* [${p.title}](${p.origin.htmlUrl}${p.origin.streamId}) from ${p.origin.title}`)
    .join('\n');

  console.log(md);
}

main();

