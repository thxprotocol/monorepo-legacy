const { defineConfig } = require('cypress');

module.exports = defineConfig({
    projectId: '1yc9c9',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 30000,
    e2e: {
        setupNodeEvents(on, config) {
            on('before:browser:launch', (browser = {}, launchOptions) => {
                //
            });
        },
    },
});
