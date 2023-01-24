describe('Sign up', () => {
    beforeEach(() => {
        cy.visit('https://dev-www.thx.network');
    });

    it('Sign up (e-mail)', () => {
        cy.get('.navbar-nav-right').contains('Wallet').click();
        cy.url().should('include', 'signin');
        cy.get('.card-footer').contains('Sign up with your e-mail').click();
        cy.url().should('include', 'signup');
        cy.get('input[placeholder="E-mail"]').type('cypress@thx.network');
        cy.get('input[placeholder="Password"]').type('LoremIpsum123!');
        cy.get('input[placeholder="Password again"]').focus().type('LoremIpsum123!');
        cy.get('#acceptTermsPrivacy').check({ force: true });
        cy.get('button[type="submit"]').click();
        cy.get('.alert-success').contains(
            'Verify your e-mail address by clicking the link we just sent you. You can close this window.',
        );
    });

    it('Sign in (e-mail not verified)', () => {
        cy.url().should('include', 'signin');
        cy.get('input[placeholder="E-mail"]').type('cypress@thx.network');
        cy.get('input[placeholder="Password"]').type('LoremIpsum123!');
        cy.get('button[type="submit"]').click();
        cy.get('.alert-danger').contains('Your e-mail is not verified. We have re-sent the activation link.');
    });
});
