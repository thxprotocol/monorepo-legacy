describe('Wallet', () => {
    it('Redirect to signin', () => {
        cy.visit('https://dev-wallet.thx.network');
        cy.url().should('include', 'https://dev.auth.thx.network');
        cy.url().should('include', 'signin');
        cy.get('input[name="email"]').type('cypress@thx.network');
        cy.get('button[type="submit"]').click();

        cy.url().should('include', 'https://dev.auth.thx.network').should('include', 'signin/otp');
        cy.contains('We sent a password to cypress@thx.network');
        cy.get('#digit0').type('1');
        cy.get('#digit1').type('2');
        cy.get('#digit2').type('3');
        cy.get('#digit3').type('4');
        cy.get('#digit4').type('5');

        cy.contains('Your one-time password is incorrect.');

        cy.get('#digit0').type('0');
        cy.get('#digit1').type('0');
        cy.get('#digit2').type('0');
        cy.get('#digit3').type('0');
        cy.get('#digit4').type('0');

        cy.url().should('include', 'https://dev-wallet.thx.network').should('include', 'signin-oidc');

        cy.contains('Authenticating your account...');
        cy.contains('Fetching your account details...');
        cy.contains('Fetching private key...');
        cy.contains('Connecting Polygon');

        cy.get('header').contains('Wallet');
        cy.get('header').contains('Wallet').click();
    });
});
