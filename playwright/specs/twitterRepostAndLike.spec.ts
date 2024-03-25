import { test, expect } from '@playwright/test';
import { Dashboard } from '../pages/dashboard';
import { Campaign } from '../pages/campaign';

test.describe('Twitter Repost and Like Quest', () => {
    test.slow();

    let dashboard: Dashboard;
    let campaign: Campaign;

    const questName = 'Test Quest 123';

    test.beforeEach(async ({ page }) => {
        dashboard = new Dashboard(page);
        campaign = new Campaign(page);
    });

    test('should create quest', async ({ page }) => {
        await dashboard.navigateTo();
        await dashboard.login();
        await dashboard.startNewQuest(questName);
        await dashboard.selectProvider(dashboard.providerItemTwitter);
        await dashboard.selectInteraction('Like & Repost');
        await dashboard.fillTweetUrl('https://twitter.com/THXprotocol/status/1711745547919339644');
        await dashboard.createSocialQuest(questName);
    });

    test('should complete quest', async ({ page }) => {
        await campaign.navigateTo();
        await campaign.openQuest(questName);
        await campaign.accessAccount();
        await campaign.completeTwitterQuest();
    });

    test('should delete quest', async ({ page }) => {
        await dashboard.navigateTo();
        await dashboard.login();
        await dashboard.deleteQuest(questName);
    });
});
