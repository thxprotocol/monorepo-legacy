describe('Wallet', () => {
    it('Use Claim URL', function () {
        cy.visit('https://dev-wallet.thx.network/claim/6f2bae81-febc-40fc-8871-985404720fde');

        cy.url().should('include', 'https://dev.auth.thx.network');
        cy.url().should('include', 'signin');

        cy.contains('Sign in and claim your');

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

        cy.contains('Fetching private key...');

        cy.url().should('include', 'collect');

        cy.contains('Congratulations!');

        cy.contains('Continue').click();

        cy.url().should('include', 'nft');
    });
});
