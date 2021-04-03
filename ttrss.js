const axios = require('axios');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json'));

// Just a utility function to post to the default URL.
// * postData: A JavaScript object with the data to be sent.
async function post(postData) {
  return await axios({
    data: postData,
    headers: {
      'Content-Length': postData.length,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    url: `${config.ttrss.url}`,
  });
}

// A function to iterate through starred articles to find
// everything saved in the specified month.
// * sid:  TinyTinyRSS session ID
// * mmyy: The month to search for as a JavaScript date
// If mmyy is not supplied, the code will assume the current
// month UNLESS the current month is new, in which case it
// uses last month, instead.
async function getPostsForMonth(sid, mmyy = null) {
  const batch = 200;
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
    const response = await post({
      "feed_id": -1, // These are starred articles.
      "is_cat": true,
      "limit": batch,
      "op": "getHeadlines",
      "order_by": "feed_dates",
      "show_content": false,
      "show_excerpt": true,
      "sid": sid,
      "skip": offset,
      "view_mode": "all_articles",
    });
    // Discard any posts that aren't from the target month.
    const inMonth = response.data.content.filter((p) => {
      const postDate = new Date(p.updated * 1000);

      return postDate.getYear() === date.getYear() &&
        postDate.getMonth() === date.getMonth();
    });
    results = results.concat(inMonth);
    // set up to get the next batch
    // If we don't have any posts in this batch, then
    // we're done.
    postsInBatch = response.data.content.length;
    offset += batch;
  } while (postsInBatch === batch);
  return results;
}

// The main program, written as a function, so that we can
// await the axios() calls instead of building an asynchronous
// nightmare.
async function main() {
  let response = await post({
    "op": "login",
    "password": config.ttrss.password,
    "user": config.ttrss.user,
  });
  const session_id = response.data.content.session_id;
  response = await getPostsForMonth(session_id);
  const html = response
    .map((p) => `* [${p.title}](${p.link}) from ${p.feed_title}`)
    .join('\n');
  console.log(html);
  response = await post({
    "op": "logout",
    "sid": session_id,
  });
}

main();

