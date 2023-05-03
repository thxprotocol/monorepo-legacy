describe('Wallet', () => {
    const RECEIVER = '0x51193777AfF37caA0E1d5C26aBCaE3f29af5510D';
    const AUTH_URL = 'https://dev.auth.thx.network';
    const WIDGET_URL =
        'https://dev-widget.thx.network/?id=61bed85b1bb13af3ca7d5c56&origin=https%3A%2F%2Fdev-dashboard.thx.network&chainId=137&theme=%7B%22elements%22%3A%7B%22btnBg%22%3A%7B%22label%22%3A%22Button%22%2C%22color%22%3A%22%235942c1%22%7D%2C%22btnText%22%3A%7B%22label%22%3A%22Button+Text%22%2C%22color%22%3A%22%23FFFFFF%22%7D%2C%22text%22%3A%7B%22label%22%3A%22Text%22%2C%22color%22%3A%22%23FFFFFF%22%7D%2C%22bodyBg%22%3A%7B%22label%22%3A%22Background%22%2C%22color%22%3A%22%23241956%22%7D%2C%22cardBg%22%3A%7B%22label%22%3A%22Card%22%2C%22color%22%3A%22%2331236d%22%7D%2C%22cardText%22%3A%7B%22label%22%3A%22Card+Text%22%2C%22color%22%3A%22%23FFFFFF%22%7D%2C%22navbarBg%22%3A%7B%22label%22%3A%22Navigation%22%2C%22color%22%3A%22%2331236d%22%7D%2C%22launcherBg%22%3A%7B%22label%22%3A%22Launcher%22%2C%22color%22%3A%22%235942c1%22%7D%2C%22launcherIcon%22%3A%7B%22label%22%3A%22Launcher+Icon%22%2C%22color%22%3A%22%23FFFFFF%22%7D%7D%2C%22colors%22%3A%7B%22accent%22%3A%7B%22label%22%3A%22Accent%22%2C%22color%22%3A%22%2398D80D%22%7D%2C%22success%22%3A%7B%22label%22%3A%22Success%22%2C%22color%22%3A%22%2328a745%22%7D%2C%22warning%22%3A%7B%22label%22%3A%22Warning%22%2C%22color%22%3A%22%23ffe500%22%7D%2C%22danger%22%3A%7B%22label%22%3A%22Danger%22%2C%22color%22%3A%22%23dc3545%22%7D%2C%22info%22%3A%7B%22label%22%3A%22Info%22%2C%22color%22%3A%22%2317a2b8%22%7D%7D%7D&logoUrl=https%3A%2F%2Fdev-thx-storage-bucket.s3.eu-west-3.amazonaws.com%2Fthx_logo_256*256-57wSR2YV24ozKEaMvzG2EN.png&title=My+Loyalty+Pool&expired=false';
    const CLAIM_URL =
        'https://dev-widget.thx.network/61bed85b1bb13af3ca7d5c56/c/2b2b9e7e-5ed4-4342-a473-487f2979effb?id=61bed85b1bb13af3ca7d5c56&origin=https%3A%2F%2Fdev-dashboard.thx.network&chainId=137&theme=%7B%22elements%22%3A%7B%22btnBg%22%3A%7B%22label%22%3A%22Button%22%2C%22color%22%3A%22%235942c1%22%7D%2C%22btnText%22%3A%7B%22label%22%3A%22Button+Text%22%2C%22color%22%3A%22%23FFFFFF%22%7D%2C%22text%22%3A%7B%22label%22%3A%22Text%22%2C%22color%22%3A%22%23FFFFFF%22%7D%2C%22bodyBg%22%3A%7B%22label%22%3A%22Background%22%2C%22color%22%3A%22%23241956%22%7D%2C%22cardBg%22%3A%7B%22label%22%3A%22Card%22%2C%22color%22%3A%22%2331236d%22%7D%2C%22cardText%22%3A%7B%22label%22%3A%22Card+Text%22%2C%22color%22%3A%22%23FFFFFF%22%7D%2C%22navbarBg%22%3A%7B%22label%22%3A%22Navigation%22%2C%22color%22%3A%22%2331236d%22%7D%2C%22launcherBg%22%3A%7B%22label%22%3A%22Launcher%22%2C%22color%22%3A%22%235942c1%22%7D%2C%22launcherIcon%22%3A%7B%22label%22%3A%22Launcher+Icon%22%2C%22color%22%3A%22%23FFFFFF%22%7D%7D%2C%22colors%22%3A%7B%22accent%22%3A%7B%22label%22%3A%22Accent%22%2C%22color%22%3A%22%2398D80D%22%7D%2C%22success%22%3A%7B%22label%22%3A%22Success%22%2C%22color%22%3A%22%2328a745%22%7D%2C%22warning%22%3A%7B%22label%22%3A%22Warning%22%2C%22color%22%3A%22%23ffe500%22%7D%2C%22danger%22%3A%7B%22label%22%3A%22Danger%22%2C%22color%22%3A%22%23dc3545%22%7D%2C%22info%22%3A%7B%22label%22%3A%22Info%22%2C%22color%22%3A%22%2317a2b8%22%7D%7D%7D&logoUrl=https%3A%2F%2Fdev-thx-storage-bucket.s3.eu-west-3.amazonaws.com%2Fthx_logo_256*256-57wSR2YV24ozKEaMvzG2EN.png&title=My+Loyalty+Pool&expired=false';

    beforeEach(() => {
        cy.viewport('iphone-xr');
    });

    it('Collect NFT with claim URL', function () {
        cy.visit(CLAIM_URL);

        cy.contains('Sign in').click();

        cy.get('input[name="email"]').type('cypress@thx.network');
        cy.get('button[type="submit"]').click();

        cy.url().should('include', AUTH_URL).should('include', 'signin/otp');
        cy.contains('We sent a password to cypress@thx.network');

        cy.get('input[placeholder="*****"]').type('12345', { force: true });

        cy.contains('Your one-time password is incorrect.');

        cy.get('input[placeholder="*****"]').type('00000', { force: true });

        cy.url().should('include', '/c/');

        cy.contains('Collect').click();
        cy.contains('Go to wallet').click();

        cy.get('.card:first-child .card-header').should('contain.text', '#');
    });

    it('Transfer NFT from wallet', function () {
        cy.visit(WIDGET_URL);

        cy.contains('Sign in').click();

        cy.get('input[name="email"]').type('cypress@thx.network');
        cy.get('button[type="submit"]').click();

        cy.url().should('include', AUTH_URL).should('include', 'signin/otp');
        cy.contains('We sent a password to cypress@thx.network');
        cy.get('input[placeholder="*****"]').type('00000', { force: true });

        cy.contains('Wallet').click();

        cy.get('.card:first-child .card-header .dropdown-toggle').click();
        cy.contains('Transfer').click();

        cy.get('.modal.show input[placeholder="0x0"]').type(RECEIVER);
        cy.get('.modal.show .modal-footer button').click();
        cy.get('.modal.show').should('not.exist');
    });
});
