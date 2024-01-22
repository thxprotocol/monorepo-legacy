const axios = require('axios');

require('dotenv').config();

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
const args = process.argv.slice(2);
const [app, version] = args;

if (webhookUrl && (!app || !version)) {
    console.error('Usage: yarn notify :app :version');
    process.exit(1);
}

const message = `Released ${app} v${version}`;

async function sendNotification() {
    try {
        await axios.post(webhookUrl, {
            content: message,
        });
        console.log('Discord Message sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error.message);
    }
}

if (webhookUrl) {
    sendNotification();
}
