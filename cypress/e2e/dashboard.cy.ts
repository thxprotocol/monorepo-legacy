const DASHBOARD_URL = 'https://dev-dashboard.thx.network';
const AUTH_URL = 'https://dev.auth.thx.network';
const CYPRESS_ACCOUNT = 'cypress@thx.network';

describe('Dashboard', () => {
    beforeEach(() => {
        cy.visit(DASHBOARD_URL);

        cy.url().should('include', AUTH_URL);
        cy.url().should('include', 'signin');

        cy.get('input[name="email"]').type(CYPRESS_ACCOUNT);
        cy.get('button[type="submit"]').click();

        cy.url().should('include', AUTH_URL).should('include', 'signin/otp');
        cy.contains(`We sent a password to ${CYPRESS_ACCOUNT}`);

        cy.get('input[placeholder="*****"]').type('00000', { force: true });
        cy.url().should('include', DASHBOARD_URL).should('include', 'signin-oidc');
    });

    it('Daily Reward', function () {
        cy.visit(DASHBOARD_URL);
        cy.contains('Reward frequent return visits to your site').click();
        cy.url().should('include', DASHBOARD_URL).should('include', 'daily');

        cy.contains('Daily Reward').click();
        cy.contains('Daily rewards are distributed to your customers every 24 hours').should('be.visible');

        cy.get('.form-group:nth-child(1) input').type('Test reward title');
        cy.get('.form-group:nth-child(2) textarea').type('Test reward description');
        cy.get('.form-group:nth-child(3) input').clear().type('15');

        cy.get('.btn').contains('Create Daily Reward').click();

        cy.get('tbody tr:nth-child(1)').contains('Test reward title').should('be.visible');
        cy.get('tbody tr:nth-child(1)').contains('15').should('be.visible');

        cy.get('tbody tr:nth-child(1) .dropdown-toggle').click();
        cy.contains('Edit').click();

        cy.get('.form-group:nth-child(1) input').clear().type('Test reward title edit');
        cy.get('.form-group:nth-child(2) textarea').clear().type('Test reward description edit');
        cy.get('.form-group:nth-child(3) input').clear().type('20');

        cy.get('.btn').contains('Update Daily Reward').click();

        cy.get('tbody tr:nth-child(1)').contains('Test reward title edit').should('be.visible');
        cy.get('tbody tr:nth-child(1)').contains('20').should('be.visible');

        cy.get('tbody tr:nth-child(1) .dropdown-toggle').click();
        cy.get('tbody tr:nth-child(1)').contains('Delete').click();

        cy.contains('There are no records to show').should('be.visible');
    });

    it('Referral Reward', function () {
        cy.visit(DASHBOARD_URL);
        cy.contains('Reward your users for inviting others.').click();
        cy.url().should('include', DASHBOARD_URL).should('include', 'referrals');

        cy.contains('Referrals').click();
        cy.get('.btn').contains('Referral Reward').click();

        cy.contains(
            'Referral rewards incentive your existing users to attract new users and will drive down your customer acquisition costs.',
        );

        cy.get('.form-group:nth-child(1) input').type('Test reward title');
        cy.get('.form-group:nth-child(2) textarea').type('Test reward description');
        cy.get('.form-group:nth-child(3) input').clear().type('15');

        cy.get('.btn').contains('Create Referral Reward').click();

        cy.get('tbody tr:nth-child(1)').contains('Test reward title');
        cy.get('tbody tr:nth-child(1)').contains('15');

        cy.get('tbody tr:nth-child(1) .dropdown-toggle').click();
        cy.get('tbody tr:nth-child(1) .dropdown').contains('Edit').click();

        cy.get('.form-group:nth-child(1) input').clear().type('Test reward title edit');
        cy.get('.form-group:nth-child(2) textarea').clear().type('Test reward description edit');
        cy.get('.form-group:nth-child(3) input').clear().type('20');

        cy.get('.btn').contains('Update Referral Reward').click();

        cy.get('tbody tr:nth-child(1)').contains('Test reward title edit');
        cy.get('tbody tr:nth-child(1)').contains('20');

        cy.get('tbody tr:nth-child(1) .dropdown-toggle').click();
        cy.get('tbody tr:nth-child(1) .dropdown').contains('Delete').click();

        cy.contains('There are no records to show').should('be.visible');
    });

    it('Conditional Reward', function () {
        cy.visit(DASHBOARD_URL);
        cy.contains('Reward engagement in other platforms.').click();
        cy.url().should('include', DASHBOARD_URL).should('include', 'conditional');

        cy.get('.nav-item').contains('Conditional').click();
        cy.get('.btn').contains('Conditional Reward').click();

        cy.contains(
            'Conditional rewards are distributed to your customers that have completed reward conditions in external platforms.',
        ).should('be.visible');

        cy.get('.form-group:nth-child(1) input').type('Test reward title');
        cy.get('.form-group:nth-child(2) textarea').type('Test reward description');
        cy.get('.form-group:nth-child(3) input').clear().type('15');

        const tweetUrl = 'https://twitter.com/twitter/status/1603121182101970945';

        cy.contains('Conditions').click();
        cy.get('#collapse-card-condition .form-group .dropdown-toggle').click();
        cy.contains('Twitter').click();
        cy.get('#collapse-card-condition .form-group .custom-select').select('Retweet');
        cy.get('#collapse-card-condition .form-group input[type="text"]').clear().type(tweetUrl);

        cy.get('.btn').contains('Create Conditional Reward').click();

        cy.get('tbody tr:nth-child(1)').contains('Test reward title');
        cy.get('tbody tr:nth-child(1)').contains('15');

        cy.get('tbody tr:nth-child(1) .dropdown-toggle').click();
        cy.get('tbody tr:nth-child(1) .dropdown').contains('Edit').click();

        cy.get('#collapse-card-condition .dropdown-select .dropdown-toggle').contains('Twitter').should('be.visible');
        cy.get('#collapse-card-condition .custom-select option:selected').should('have.text', 'Retweet');
        cy.get('#collapse-card-condition .form-group input[type="text"]').should('have.value', tweetUrl);

        cy.get('.form-group:nth-child(1) input').clear().type('Test reward title edit');
        cy.get('.form-group:nth-child(2) textarea').clear().type('Test reward description edit');
        cy.get('.form-group:nth-child(3) input').clear().type('20');

        cy.get('.btn').contains('Update Conditional Reward').click();

        cy.get('tbody tr:nth-child(1)').contains('Test reward title edit').should('be.visible');
        cy.get('tbody tr:nth-child(1)').contains('20').should('be.visible');

        cy.get('tbody tr:nth-child(1) .dropdown-toggle').click();
        cy.get('tbody tr:nth-child(1) .dropdown').contains('Delete').click();

        cy.contains('There are no records to show').should('be.visible');
    });
});
