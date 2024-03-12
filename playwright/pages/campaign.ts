import { Locator, Page } from '@playwright/test';

export class Campaign {
  readonly page: Page;

  readonly availableTab: Locator
  readonly signInAndClaimButton: Locator

  readonly emailInput: Locator;

  constructor(page: Page) {
    this.page = page;

    this.availableTab = this.page.getByRole('tab', { name: 'Available' });
    this.signInAndClaimButton = this.page.getByRole('button', { name: 'Sign in & claim 100 points' });
    this.emailInput = this.page.getByPlaceholder('E-mail')
  }

  async navigateTo() {
    await this.page.goto('https://dev-app.thx.network/c/63d579aff1673a8c1a749dbb/quests');
    await this.availableTab.waitFor({ state: 'visible' });
  }

  async openQuest(questName: string) {
    await this.page.getByRole('heading', { name: questName }).click();
    await this.signInAndClaimButton.click();

    await this.page.getByRole('heading', { name: 'Access your account' }).waitFor({ state: 'visible' });
  }

  async accessAccount() {
    await this.emailInput.fill('cypress@thx.network');

    const popupPromise = this.page.waitForEvent('popup');
    await this.page.getByRole('button', { name: 'Send one-time password' }).click();

    const popup = await popupPromise;

    await popup.waitForLoadState();

    await popup.getByPlaceholder('*****').waitFor({ state: 'visible' });
    await this.page.waitForTimeout(1000);
    await popup.getByPlaceholder('*****').fill('00000');

    await this.page.waitForTimeout(1000);
  }

  async completeTwitterQuest() {
    await this.page.getByRole('button', { name: 'Repost & Like on 𝕏' }).waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: 'Repost & Like on 𝕏' }).click();

    await this.page.bringToFront();

    await this.page.getByRole('button', { name: 'Claim 100 points' }).waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: 'Claim 100 points' }).click();

    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async completeDiscordQuest() {
    await this.page.pause()
    await this.page.getByRole('button', { name: 'Join Discord' }).waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: 'Join Discord' }).click();

    await this.page.bringToFront();

    await this.page.getByRole('button', { name: 'Claim 100 points' }).waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: 'Claim 100 points' }).click();


    await this.page.pause()
    // await this.page.getByText('You have earned 100 points').waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: 'Continue' }).click();

    await this.page.pause()
  }

  async completeYoutubeQuest() {
    await this.page.pause()
    await this.page.getByRole('button', { name: 'Repost & Like on 𝕏' }).waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: 'Repost & Like on 𝕏' }).click();

    await this.page.bringToFront();

    await this.page.getByRole('button', { name: 'Claim 100 points' }).waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: 'Claim 100 points' }).click();


    await this.page.pause()
    // await this.page.getByText('You have earned 100 points').waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: 'Continue' }).click();

    await this.page.pause()
  }
}
