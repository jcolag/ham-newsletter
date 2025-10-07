const axios = require('axios');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json'));
const now = new Date();

// A utility function to GET from the default URL.
// * postData: A JavaScript object with the data to be sent.
async function get(endpoint, session) {
  return await axios({
    headers: {
      'X-Session-ID': session,
    },
    method: 'GET',
    url: `${config.shiori.url}/api/${endpoint}`,
  });
}

// A utility function to POST to the default URL.
// * postData: A JavaScript object with the data to be sent.
async function post(postData, endpoint, session) {
  return await axios({
    data: postData,
    headers: {
      'Content-Length': postData ? postData.length : 0,
      'Content-Type': 'application/json',
      'X-Session-ID': session,
    },
    method: 'POST',
    url: `${config.shiori.url}/api/${endpoint}`,
  });
}

async function getBookmarksForMonth(session_id) {
  let bookmarks = await get('bookmarks', session_id);

  return bookmarks;
}

// The main program, written as a function, so that we can
// await the axios() calls instead of building an asynchronous
// nightmare.
async function main(from, to) {
  let response = await post({
    "owner": true,
    "password": config.shiori.password,
    "remember": true,
    "username": config.shiori.user,
  },
  'v1/auth/login',
  null);
  const session_id = response.data.message.session;
  response = await getBookmarksForMonth(session_id);

  const bookmarks = response.data.bookmarks
    .filter((b) => new Date(b.createdAt) > start && new Date(b.createdAt) < end)
    .map((b) => `* [${b.title}](${b.url})`)
    .join('\n');

  response = await post(null, 'logout', session_id);
  console.log(bookmarks);
}

const year = now.getFullYear();
let month = now.getMonth();

if (now.getDate() < 10) {
  // If it's early in the month, we mean last month.
  month = month - 1;
  now.setMonth(month);
}

const start = new Date(year, month, 1);
const end = new Date(year, month + 1, 1);
const bookmarks = main(start, end);

