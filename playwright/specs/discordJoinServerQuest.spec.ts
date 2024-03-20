import {test, expect} from '@playwright/test';
import { Dashboard } from '../pages/dashboard';
import { Campaign } from '../pages/campaign';

test.describe('Discord Join Server Quest', () => {
  let dashboard: Dashboard;
  let campaign: Campaign;

  const questName = 'Test Quest 456';

  test.beforeEach(async ({page}) => {
    dashboard = new Dashboard(page);
    campaign = new Campaign(page);
  });

  test('should create quest', async ({ page }) => {
    await dashboard.navigateTo();
    await dashboard.login()
    await dashboard.startNewQuest(questName);
    await dashboard.selectProvider(dashboard.providerItemDiscord)
    await dashboard.selectInteraction('Server Joined')
    await dashboard.page.pause()
    await dashboard.fillDiscordServerIdAndInviteUrl('1210947254761037849', 'https://discord.gg/836147176270856243');
    await dashboard.createSocialQuest(questName);
    // Discord channel ID?
  });

  test('should complete quest', async ({ page }) => {
    await campaign.navigateTo();
    await campaign.page.pause()
    await campaign.openQuest(questName);
    await campaign.accessAccount();
    await campaign.completeDiscordQuest();
  });

  test('should delete quest', async ({ page }) => {
    await dashboard.navigateTo();
    await dashboard.login();
    await dashboard.deleteQuest('Test Quest 456');
  });
});
