describe('Wallet', () => {
    beforeEach(() => {
        cy.viewport('iphone-xr');
        cy.visit('https://dev-wallet.thx.network');
    });

    it('Sign in (e-mail verified)', () => {
        cy.url().should('include', 'signin');
        cy.get('input[placeholder="E-mail"]').type('cypress@thx.network');
        cy.get('input[placeholder="Password"]').type('LoremIpsum123!');
        cy.get('button[type="submit"]').click();
        cy.contains('Fetching your account details...');
        cy.contains('Fetching private key...');
        cy.contains('Connecting Polygon...');
        cy.contains('No tokens are visible for your account.');
    });
});
