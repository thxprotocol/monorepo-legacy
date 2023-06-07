describe('Dashboard', () => {
    // const DASHBOARD_URL = 'https://dev-dashboard.thx.network';
    const DASHBOARD_URL = 'https://localhost:8082';
    const AUTH_URL = 'https://localhost:3030';
    const CYPRESS_ACCOUNT = 'cypress@thx.network';

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

    it('Daily Quests', function () {
        cy.visit(DASHBOARD_URL);
        cy.contains('Reward frequent return visits to your application').click();
        cy.url().should('include', DASHBOARD_URL).should('include', 'quests');

        cy.contains('New Quest').click();
        cy.get('.justify-content-end .dropdown-menu').contains('Daily').click();
        cy.get('.modal').contains('Create Daily Quest').should('be.visible');

        cy.get('.form-group:nth-child(1) input[type="text"]').type('Test reward title');
        cy.get('.form-group:nth-child(2) textarea').type('Test reward description');
        cy.get('.form-group:nth-child(3) .form-group:nth-child(1) input[type="number"]').clear().type('2');

        cy.get('.btn').contains('Create Daily Quest').click();

        cy.get('tbody tr:nth-child(1)').contains('Test reward title').should('be.visible');
        cy.get('tbody tr:nth-child(1)').contains('7 days').should('be.visible');

        cy.get('tbody tr:nth-child(1) .dropdown-toggle').click();
        cy.contains('Edit').click();

        cy.get('.form-group:nth-child(1) input[type="text"]').clear().type('Test reward title edit');
        cy.get('.form-group:nth-child(2) textarea').clear().type('Test reward description edit');
        cy.contains('Add amount').click();
        cy.get('.form-group:nth-child(3) .form-group:nth-child(8) input[type="number"]').clear().type('20');

        cy.get('.btn').contains('Update Daily Quest').click();

        cy.get('tbody tr:nth-child(1)').contains('Test reward title edit').should('be.visible');
        cy.get('tbody tr:nth-child(1)').contains('8 days').should('be.visible');

        cy.get('thead th[role="columnheader"] .custom-control-label').click();
        cy.contains('Delete quests').click();
        cy.contains('There are no records to show').should('be.visible');
    });

    it('Referral Quests', function () {
        cy.visit(DASHBOARD_URL);
        cy.contains('Reward your users for inviting others').click();
        cy.url().should('include', DASHBOARD_URL).should('include', 'quests');

        cy.contains('New Quest').click();
        cy.get('.justify-content-end .dropdown-menu').contains('Referral').click();
        cy.get('.modal').contains('Create Referral Quest').should('be.visible');

        cy.get('.form-group:nth-child(1) input').type('Test reward title');
        cy.get('.form-group:nth-child(2) textarea').type('Test reward description');
        cy.get('.form-group:nth-child(3) input').clear().type('15');

        cy.get('.btn').contains('Create Referral Quest').click();

        cy.get('tbody tr:nth-child(1)').contains('Test reward title');
        cy.get('tbody tr:nth-child(1)').contains('15');

        cy.get('tbody tr:nth-child(1) .dropdown-toggle').click();
        cy.contains('Edit').click();

        cy.get('.form-group:nth-child(1) input').clear().type('Test reward title edit');
        cy.get('.form-group:nth-child(2) textarea').clear().type('Test reward description edit');
        cy.get('.form-group:nth-child(3) input').clear().type('20');

        cy.get('.btn').contains('Update Referral Quest').click();

        cy.get('tbody tr:nth-child(1)').contains('Test reward title edit');
        cy.get('tbody tr:nth-child(1)').contains('20');

        cy.get('thead th[role="columnheader"] .custom-control-label').click();
        cy.contains('Delete quests').click();
        cy.contains('There are no records to show').should('be.visible');
    });

    it('Social Quests', function () {
        cy.visit(DASHBOARD_URL);
        cy.contains('Reward engagement in social channels').click();
        cy.url().should('include', DASHBOARD_URL).should('include', 'quests');

        cy.contains('New Quest').click();
        cy.get('.justify-content-end .dropdown-menu').contains('Social').click();
        cy.get('.modal').contains('Create Social Quest').should('be.visible');

        const tweetUrl = 'https://twitter.com/twitter/status/1603121182101970945';

        cy.contains('Conditions').click();
        cy.get('#collapse-card-condition .form-group .dropdown-toggle').click();
        cy.contains('Twitter').click();
        cy.get('#collapse-card-condition .form-group .custom-select').select('Retweet');
        cy.get('#collapse-card-condition .form-group input[type="text"]').type(tweetUrl);

        cy.contains('Loyalty Networks are here').should('be.visible');

        cy.get('.form-group:nth-child(1) input').type('Test reward title');
        cy.get('.form-group:nth-child(2) textarea').type('Test reward description');
        cy.get('.form-group:nth-child(3) input').clear().type('15');

        cy.get('.btn').contains('Create Social Quest').click();

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

        cy.get('.btn').contains('Update Social Quest').click();

        cy.get('tbody tr:nth-child(1)').contains('Test reward title edit').should('be.visible');
        cy.get('tbody tr:nth-child(1)').contains('20').should('be.visible');

        cy.get('thead th[role="columnheader"] .custom-control-label').click();
        cy.contains('Delete quests').click();
        cy.contains('There are no records to show').should('be.visible');
    });

    it('Custom Quests', function () {
        cy.visit(DASHBOARD_URL);
        cy.contains('Reward important achievements in your application').click();
        cy.url().should('include', DASHBOARD_URL).should('include', 'quests');

        cy.contains('New Quest').click();
        cy.get('.justify-content-end .dropdown-menu').contains('Custom').click();
        cy.get('.modal').contains('Create Custom Quest').should('be.visible');

        cy.get('.form-group:nth-child(1) input').type('Test reward title');
        cy.get('.form-group:nth-child(2) textarea').type('Test reward description');
        cy.get('.form-group:nth-child(3) input').clear().type('15');
        cy.get('.form-group:nth-child(4) input').clear().type('1');

        cy.get('.btn').contains('Create Custom Quest').click();

        cy.get('tbody tr:nth-child(1)').contains('Test reward title');
        cy.get('tbody tr:nth-child(1)').contains('15');

        cy.get('tbody tr:nth-child(1) .dropdown-toggle').click();
        cy.contains('Edit').click();

        cy.get('.form-group:nth-child(1) input').clear().type('Test reward title edit');
        cy.get('.form-group:nth-child(2) textarea').clear().type('Test reward description edit');
        cy.get('.form-group:nth-child(3) input').clear().type('20');
        cy.get('.form-group:nth-child(4) input').clear().type('2');

        cy.get('.btn').contains('Update Custom Quest').click();

        cy.get('tbody tr:nth-child(1)').contains('Test reward title edit');
        cy.get('tbody tr:nth-child(1)').contains('20');

        cy.get('thead th[role="columnheader"] .custom-control-label').click();
        cy.contains('Delete quests').click();
        cy.contains('There are no records to show').should('be.visible');
    });
});
