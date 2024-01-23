const axios = require('axios');

require('dotenv').config();

const args = process.argv.slice(2);
const [app, version, webhook] = args;

if (!app || !version || !webhook) {
    console.error('Usage: yarn notify :app :version :webhook');
    process.exit(1);
}

const message = `Released ${app} v${version}`;

async function sendNotification() {
    try {
        await axios.post(webhook, {
            content: message,
        });
        console.log('Discord Message sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error.message);
    }
}

if (webhook) {
    sendNotification();
}
