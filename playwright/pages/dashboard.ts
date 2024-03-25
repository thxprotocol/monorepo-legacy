import { Locator, Page } from '@playwright/test';
import { Datepicker } from '../components/datepicker/datepicker';
import { sleep } from '../../apps/api/src/app/util';

export class Dashboard {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly sendOTPButton: Locator;
    readonly otpInput: Locator;
    readonly welcomeHeader: Locator;

    readonly questsLink: Locator;

    readonly youtubeQuest: Locator;
    readonly newQuestButton: Locator;
    readonly newYoutiubeQuestButton: Locator;
    readonly titleInput: Locator;
    readonly descriptionInput: Locator;
    readonly amountInput: Locator;
    readonly interactionSelect: Locator;
    readonly providerSelect: Locator;
    readonly providerItemTwitter: Locator;
    readonly providerItemDiscord: Locator;
    readonly providerItemYouTube: Locator;
    readonly createSocialQuestButton: Locator;

    // X
    readonly tweetUrlInput: Locator;
    readonly previewButton: Locator;
    readonly tweetPreviewLocator: Locator;

    // Discord
    readonly serverIdInput: Locator;
    readonly inviteUrlInput: Locator;

    readonly questOptions: Locator;
    readonly deleteQuestButton: Locator;

    readonly publishedCheckbox: Locator;

    readonly datepicker: Datepicker;

    getInputLocator(label: string) {
        return this.page.locator(`//legend[text()='${label}']//..//input`);
    }

    getTextareaLocator(label: string) {
        return this.page.locator(`//legend[text()='${label}']//..//textarea`);
    }

    getSelectLocator(label: string) {
        return this.page.locator(`//legend[text()='${label}']//..//select`);
    }

    getProviderItemLocator(provider: string) {
        if (provider === 'Twitter') {
            return this.page.getByRole('menuitem', { name: 'Twitter Twitter' });
        } else if (provider === 'Discord') {
            return this.page.getByRole('menuitem', { name: 'Discord Discord' });
        } else if (provider === 'YouTube') {
            return this.page.getByRole('menuitem', { name: 'YouTube YouTube' });
        }
    }

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.getByPlaceholder('yourname@example.com');
        this.sendOTPButton = page.getByRole('button', { name: 'Send one-time password' });
        this.otpInput = page.getByPlaceholder('*****');
        this.welcomeHeader = page.getByText('Hi Hacky Tech');

        this.questsLink = page.getByRole('link', { name: 'Quests' });

        this.youtubeQuest = page.getByText('Youtube Quest Expand your');
        this.newQuestButton = page.getByRole('button', { name: 'New Quest' });
        this.newYoutiubeQuestButton = page.getByRole('menuitem', { name: 'Amplify your presence on' });
        this.titleInput = this.getInputLocator('Title');
        this.descriptionInput = this.getTextareaLocator('Description');
        this.amountInput = this.getInputLocator('Amount');
        this.interactionSelect = this.getSelectLocator('Interaction');
        this.createSocialQuestButton = page.getByRole('button', { name: 'Create Social Quest' });
        this.providerSelect = page.getByRole('button', { name: 'YouTube YouTube' });
        this.providerItemDiscord = this.getProviderItemLocator('Discord');
        this.providerItemTwitter = this.getProviderItemLocator('Twitter');
        this.providerItemYouTube = this.getProviderItemLocator('YouTube');

        // Twitter
        this.tweetUrlInput = this.getInputLocator('Tweet URL');
        this.previewButton = page.getByRole('button', { name: 'Preview', exact: true });
        this.tweetPreviewLocator = page.getByRole('link', { name: 'THX Network - Rewards in Any' });

        // Discord
        this.serverIdInput = this.getInputLocator('Server ID');
        this.inviteUrlInput = this.getInputLocator('Invite URL');

        this.publishedCheckbox = page.getByLabel('Create Social Quest').getByText('Published');

        this.questOptions = page.locator('td').filter({ hasText: 'Edit Delete' });
        this.deleteQuestButton = page.getByRole('menuitem', { name: 'Delete' });

        this.datepicker = new Datepicker(page);
    }

    async navigateTo() {
        await this.page.goto('https://dev-dashboard.thx.network');
        await this.emailInput.waitFor({ state: 'visible' });
        await this.page.waitForTimeout(1000);
    }

    async login() {
        await this.emailInput.fill('cypress@thx.network');
        await this.sendOTPButton.click();
        await this.otpInput.waitFor({ state: 'visible' });
        await this.page.waitForTimeout(1000);
        await this.otpInput.fill('00000');
        await this.welcomeHeader.waitFor({ state: 'visible' });
    }

    async startNewQuest(questName: string) {
        await this.youtubeQuest.click();
        await this.newQuestButton.click();
        await this.newYoutiubeQuestButton.click();
        await this.titleInput.fill(questName);
        await this.descriptionInput.fill('Like 10 videos');
        await this.amountInput.fill('100');

        await this.datepicker.openDatepickerFirstTime();

        await this.datepicker.nextMonthButton.click();
        await this.datepicker.nextMonthButton.click();
        await this.datepicker.nextMonthButton.click();

        const currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() + 3);

        await this.datepicker.selectDate(currentDate);
    }

    async selectInteraction(interaction: string) {
        await this.interactionSelect.selectOption({ label: interaction });
    }

    async selectProvider(providerItem: Locator) {
        await this.providerSelect.click();
        await providerItem.click();
    }

    async fillTweetUrl(url: string) {
        await this.tweetUrlInput.fill(url);
        await this.previewButton.click();
        await this.tweetPreviewLocator.waitFor({ state: 'visible' });
    }

    async fillDiscordServerIdAndInviteUrl(serverId: string, inviteUrl: string) {
        await this.serverIdInput.fill(serverId);
        await this.inviteUrlInput.fill(inviteUrl);
    }

    async fillYoutubeFields() {
        await this.page.pause();
    }

    async createSocialQuest(questName: string) {
        await this.publishedCheckbox.scrollIntoViewIfNeeded();
        await this.publishedCheckbox.click();
        await this.createSocialQuestButton.click();
        await this.page.getByRole('heading', { name: 'Quests' }).waitFor({ state: 'visible' });
        await this.page.getByRole('cell', { name: questName }).waitFor({ state: 'visible' });
        await this.page.waitForTimeout(500);
    }

    async deleteQuest(questName: string) {
        await this.questsLink.click();
        await this.page.getByRole('heading', { name: 'Quests' }).waitFor({ state: 'visible' });
        await this.page.getByRole('cell', { name: questName }).waitFor({ state: 'visible' });

        await this.questOptions.click();
        await this.deleteQuestButton.click();

        await this.page.getByText('There are no records to show').waitFor({ state: 'visible' });
    }
}
