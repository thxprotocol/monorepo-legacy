describe('Wallet', () => {
    const DASHBOARD_URL = 'https://dev-dashboard.thx.network';
    const RECEIVER = '0x51193777AfF37caA0E1d5C26aBCaE3f29af5510D';
    const AUTH_URL = 'https://dev.auth.thx.network';
    const WIDGET_URL =
        'https://dev-widget.thx.network/?id=61bed85b1bb13af3ca7d5c56&origin=https%3A%2F%2Fdev-dashboard.thx.network&chainId=137&theme=%7B%22elements%22%3A%7B%22btnBg%22%3A%7B%22label%22%3A%22Button%22%2C%22color%22%3A%22%235942c1%22%7D%2C%22btnText%22%3A%7B%22label%22%3A%22Button+Text%22%2C%22color%22%3A%22%23FFFFFF%22%7D%2C%22text%22%3A%7B%22label%22%3A%22Text%22%2C%22color%22%3A%22%23FFFFFF%22%7D%2C%22bodyBg%22%3A%7B%22label%22%3A%22Background%22%2C%22color%22%3A%22%23241956%22%7D%2C%22cardBg%22%3A%7B%22label%22%3A%22Card%22%2C%22color%22%3A%22%2331236d%22%7D%2C%22cardText%22%3A%7B%22label%22%3A%22Card+Text%22%2C%22color%22%3A%22%23FFFFFF%22%7D%2C%22navbarBg%22%3A%7B%22label%22%3A%22Navigation%22%2C%22color%22%3A%22%2331236d%22%7D%2C%22launcherBg%22%3A%7B%22label%22%3A%22Launcher%22%2C%22color%22%3A%22%235942c1%22%7D%2C%22launcherIcon%22%3A%7B%22label%22%3A%22Launcher+Icon%22%2C%22color%22%3A%22%23FFFFFF%22%7D%7D%2C%22colors%22%3A%7B%22accent%22%3A%7B%22label%22%3A%22Accent%22%2C%22color%22%3A%22%2398D80D%22%7D%2C%22success%22%3A%7B%22label%22%3A%22Success%22%2C%22color%22%3A%22%2328a745%22%7D%2C%22warning%22%3A%7B%22label%22%3A%22Warning%22%2C%22color%22%3A%22%23ffe500%22%7D%2C%22danger%22%3A%7B%22label%22%3A%22Danger%22%2C%22color%22%3A%22%23dc3545%22%7D%2C%22info%22%3A%7B%22label%22%3A%22Info%22%2C%22color%22%3A%22%2317a2b8%22%7D%7D%7D&logoUrl=https%3A%2F%2Fdev-thx-storage-bucket.s3.eu-west-3.amazonaws.com%2Fthx_logo_256*256-57wSR2YV24ozKEaMvzG2EN.png&title=My+Loyalty+Pool&expired=false';
    const CLAIM_URL =
        'https://dev-widget.thx.network/61bed85b1bb13af3ca7d5c56/c/{uuid}?id=61bed85b1bb13af3ca7d5c56&origin=https%3A%2F%2Fdev-dashboard.thx.network&chainId=137&theme=%7B%22elements%22%3A%7B%22btnBg%22%3A%7B%22label%22%3A%22Button%22%2C%22color%22%3A%22%235942c1%22%7D%2C%22btnText%22%3A%7B%22label%22%3A%22Button+Text%22%2C%22color%22%3A%22%23FFFFFF%22%7D%2C%22text%22%3A%7B%22label%22%3A%22Text%22%2C%22color%22%3A%22%23FFFFFF%22%7D%2C%22bodyBg%22%3A%7B%22label%22%3A%22Background%22%2C%22color%22%3A%22%23241956%22%7D%2C%22cardBg%22%3A%7B%22label%22%3A%22Card%22%2C%22color%22%3A%22%2331236d%22%7D%2C%22cardText%22%3A%7B%22label%22%3A%22Card+Text%22%2C%22color%22%3A%22%23FFFFFF%22%7D%2C%22navbarBg%22%3A%7B%22label%22%3A%22Navigation%22%2C%22color%22%3A%22%2331236d%22%7D%2C%22launcherBg%22%3A%7B%22label%22%3A%22Launcher%22%2C%22color%22%3A%22%235942c1%22%7D%2C%22launcherIcon%22%3A%7B%22label%22%3A%22Launcher+Icon%22%2C%22color%22%3A%22%23FFFFFF%22%7D%7D%2C%22colors%22%3A%7B%22accent%22%3A%7B%22label%22%3A%22Accent%22%2C%22color%22%3A%22%2398D80D%22%7D%2C%22success%22%3A%7B%22label%22%3A%22Success%22%2C%22color%22%3A%22%2328a745%22%7D%2C%22warning%22%3A%7B%22label%22%3A%22Warning%22%2C%22color%22%3A%22%23ffe500%22%7D%2C%22danger%22%3A%7B%22label%22%3A%22Danger%22%2C%22color%22%3A%22%23dc3545%22%7D%2C%22info%22%3A%7B%22label%22%3A%22Info%22%2C%22color%22%3A%22%2317a2b8%22%7D%7D%7D&logoUrl=https%3A%2F%2Fdev-thx-storage-bucket.s3.eu-west-3.amazonaws.com%2Fthx_logo_256*256-57wSR2YV24ozKEaMvzG2EN.png&title=My+Loyalty+Pool&expired=false';
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

    it('Transfer NFT from wallet', function () {
        cy.viewport('iphone-xr');
        cy.visit(WIDGET_URL);

        cy.contains('Sign in').click();

        cy.get('.navbar .dropdown-toggle').click();
        cy.get('.navbar .dropdown-menu li:first-child button').click();

        cy.get('.card:first-child .dropdown-toggle').click();
        cy.get('.card:first-child .dropdown-menu li:first-child button').click();

        cy.get('.modal.show input[placeholder="0x0"]').type(RECEIVER);
        cy.get('.modal.show .modal-footer button').click();
        cy.get('.modal.show').should('not.exist');
    });

    it('Create Claim URL', () => {
        cy.viewport('macbook-13');
        cy.visit(DASHBOARD_URL);

        cy.get('.navbar').contains('Shop perks');
        cy.visit(DASHBOARD_URL + '/pool/63d579aff1673a8c1a749dbb/erc721-perks');

        // Remove existing perks
        cy.get('thead th[role="columnheader"] .custom-control-label').click();
        cy.contains('Delete perks').click();

        cy.get('.sidebar-sibling .container-md .justify-content-end .btn-primary').click();
        cy.contains('NFT perks let your customers claim NFTs from your collection.').should('be.visible');

        // Set perk title (administrative)
        cy.get('.col-md-6 > .form-group:nth-child(1) input').type('E2E Test Perk');

        // Set collection
        cy.get('.col-md-6 > .form-group:nth-child(3) .dropdown-toggle').click();
        cy.contains('E2E-TST').click();
        // Set metadata
        cy.get('.col-md-6 > .form-group:nth-child(4) .dropdown-toggle').click();
        cy.contains('E2E test metadata').click();

        // Set Claim URL amount
        cy.get('button[aria-controls="collapse-card-claim-amount"]').click();
        cy.get('#collapse-card-claim-amount input').clear().type('1');

        // Submit and verify
        cy.get('.modal-footer .btn-primary').click();
        cy.contains('E2E Test Perk');

        // Open Claim URL modal
        cy.get('tbody tr td .progress').click();

        // Fetch first claim URL
        cy.get('.modal tbody tr td code.text-muted')
            .contains(DASHBOARD_URL)
            .should('be.visible')
            .invoke('text')
            .should((value) => {
                const urlParts = value.split('/');
                const uuid = urlParts[urlParts.length - 1].replace(/\s/g, '');
                const widgetUrl = CLAIM_URL.replace('{uuid}', uuid);

                Cypress.env('WIDGET_COLLECT_URL', widgetUrl);
            });

        // Close claim URL modal
        cy.get('button[aria-label="Close"]').click();
    });

    it('Visit claim URL', () => {
        // Change to mobile viewport and visit Claim URL
        cy.viewport('iphone-xr');
        cy.visit(Cypress.env('WIDGET_COLLECT_URL') as string);
        cy.url().should('include', '/c/');

        // Sign in
        cy.contains('Sign in & Collect').should('be.visible').click();
        cy.contains('Collect').should('be.visible').click();
        cy.contains('Go to wallet').should('be.visible').click();

        cy.get('.card:first-child .card-title .text-accent').should('contain.text', '#');
    });
});
