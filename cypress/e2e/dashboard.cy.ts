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
        cy.visit(DASHBOARD_URL + '/pools');
        cy.get('.card').click();
        cy.get('.nav-item').contains('Daily').click();
        cy.get('.btn').contains('Daily Reward').click();

        cy.contains('Daily rewards are distributed to your customers every 24 hours');

        cy.get('.form-group:nth-child(1) input').type('Test reward title');
        cy.get('.form-group:nth-child(2) textarea').type('Test reward description');
        cy.get('.form-group:nth-child(3) input').clear().type('15');

        cy.get('.btn').contains('Create Daily Reward').click();

        cy.get('tbody tr:nth-child(1)').contains('Test reward title');
        cy.get('tbody tr:nth-child(1)').contains('15');

        cy.get('tbody tr:nth-child(1) .dropdown-toggle').click();
        cy.get('tbody tr:nth-child(1) .dropdown').contains('Edit').click();

        cy.get('.form-group:nth-child(1) input').clear().type('Test reward title edit');
        cy.get('.form-group:nth-child(2) textarea').clear().type('Test reward description edit');
        cy.get('.form-group:nth-child(3) input').clear().type('20');

        cy.get('.btn').contains('Update Daily Reward').click();

        cy.get('tbody tr:nth-child(1)').contains('Test reward title edit');
        cy.get('tbody tr:nth-child(1)').contains('20');

        cy.get('tbody tr:nth-child(1) .dropdown-toggle').click();
        cy.get('tbody tr:nth-child(1) .dropdown').contains('Delete').click();
    });

    it('Referral Reward', function () {
        cy.visit(DASHBOARD_URL + '/pools');
        cy.get('.card').click();
        cy.get('.nav-item').contains('Referrals').click();
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
    });

    it('Conditional Reward', function () {
        cy.visit(DASHBOARD_URL + '/pools');
        cy.get('.card').click();
        cy.get('.nav-item').contains('Conditional').click();
        cy.get('.btn').contains('Conditional Reward').click();

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
    });
});
