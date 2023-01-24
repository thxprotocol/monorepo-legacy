describe('Dashboard', () => {
    beforeEach(() => {
        cy.visit('https://dev-wallet.thx.network');
    });

    it('Sign in (e-mail verified)', () => {
        cy.url().should('include', 'signin');
        cy.get('input[placeholder="E-mail"]').type('cypress@thx.network');
        cy.get('input[placeholder="Password"]').type('LoremIpsum123!');
        cy.get('button[type="submit"]').click();
    });
});
