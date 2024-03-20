import {test, expect} from '@playwright/test';
import { Dashboard } from '../pages/dashboard';
import { Campaign } from '../pages/campaign';

test.describe('Youtube Subscribe Quest', () => {
  let dashboard: Dashboard;
  let campaign: Campaign;

  const questName = 'Test Quest 101112';

  test.beforeEach(async ({page}) => {
    dashboard = new Dashboard(page);
    campaign = new Campaign(page);
  });

  test('should create quest', async ({ page }) => {
    await dashboard.navigateTo();
    await dashboard.login()
    await dashboard.startNewQuest(questName);
    await dashboard.selectProvider(dashboard.providerItemYouTube)
    await dashboard.selectInteraction('Subscribe')
    await dashboard.createSocialQuest(questName);
    await dashboard.page.pause()
  });

  test('should complete quest', async ({ page }) => {
    await campaign.navigateTo();
    await campaign.page.pause()
    await campaign.openQuest(questName);
    await campaign.accessAccount();
    await campaign.completeYoutubeQuest();
  });

  test('should delete quest', async ({ page }) => {
    await dashboard.navigateTo();
    await dashboard.login();
    await dashboard.deleteQuest(questName);
  });
});
