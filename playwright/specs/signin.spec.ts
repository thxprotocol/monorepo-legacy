import { test, expect } from '@playwright/test';
import { Dashboard } from '../pages/dashboard';

test.describe('Signin', () => {
    let dashboard: Dashboard;

    test.beforeEach(async ({ page }) => {
        dashboard = new Dashboard(page);
    });

    test('should signin', async ({ page }) => {
        await dashboard.navigateTo();
        await dashboard.login();
        await expect(dashboard.welcomeHeader).toBeVisible();
    });
});
