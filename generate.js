const axios = require('axios');
const fs = require('fs');
const opn = require('opn');

const argv = process.argv.slice(2);
const config = JSON.parse(fs.readFileSync('./config.json'));
const server = config.mailchimp.apiKey.split('-')[1];
const username = Math.random().toString(36).substring(2);
const date = new Date();
const month = new Date(
    date.setDate(date.getDate() - 10)
  )
  .toLocaleString('default', { month: 'long' });
const year = date.getFullYear();
let postData = {
  'recipients': {
    'list_id': config.mailchimp.recipients,
  },
  'settings': {
    'subject_line': `${config.general.siteName} - ${month} ${year} Newsletter`,
    'preview_text': config.general.tagline,
    'title': `${config.general.siteName} - ${month} ${year} Newsletter`,
    'from_name': config.general.fromName,
    'reply_to': config.general.fromAddress,
    'use_conversation': true,
    'to_name': 'FNAME',
    'folder_id': config.mailchimp.folder,
    'authenticate': true,
    'tracking': {
      'opens': true,
      'html_clicks': true,
      'text_clicks': true,
      'goal_tracking': false,
      'ecomm360': false,
    },
  },
  'type': 'regular',
};

// Create a new campaign.
const createResult = axios({
  data: postData,
  headers: {
    'Authorization': `apikey ${config.mailchimp.apiKey}`,
    'Content-Length': postData.length,
    'Content-Type': 'application/json',
  },
  method: 'POST',
  url: `https://${server}.api.mailchimp.com/3.0/campaigns/`,
}).then((response) => {
  if (response.status === 200) {
    const campaignId = response.data.id;
    const putData = {
      html: fs.readFileSync(argv[0], 'utf-8'),
    };
    // Add the supplied content to the campaign.
    const putResult = axios({
      data: putData,
      headers: {
        'Authorization': `apikey ${config.mailchimp.apiKey}`,
        'Content-Length': putData.length,
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      url: `https://${server}.api.mailchimp.com/3.0/campaigns/${campaignId}/content/`,
    }).then((response) => {
      if (response.status !== 200) {
        console.log(response);
      }

      // Open the Campaign page in a browser to edit and send it.
      opn(`https://${server}.admin.mailchimp.com/campaigns/`);
    }).catch((error) => {
      console.log('PUT campaign content');
      console.log(error);
      console.log(error.response.data);
      console.log(error.response.data.errors);
    });
  }
}).catch((error) => {
  console.log('POST new campaign');
  console.log(error);
  console.log(error.response.data.errors);
});

