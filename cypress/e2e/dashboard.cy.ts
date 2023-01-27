describe('Dashboard', () => {
    it('Redirect to signin', () => {
        cy.visit('https://dev-dashboard.thx.network');
        cy.url().should('include', 'https://dev.auth.thx.network');
        cy.url().should('include', 'signin');
    });

    it('Redirect to signin/otp after submit', () => {
        cy.get('input[name="email"]').type('cypress@thx.network');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', 'https://dev.auth.thx.network').should('include', 'signin/otp');
    });
});
