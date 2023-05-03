describe('Wallet', () => {
    const AUTH_URL = 'https://localhost:3030';
    const WIDGET_URL =
        'https://localhost:8080/?id=644f689bf62a81e0f69dbf6a&origin=https%3A%2F%2Flocalhost%3A8081&chainId=31337&logoUrl=https%3A%2F%2Flocal-thx-storage-bucket.s3.eu-west-3.amazonaws.com%2Flogo-padding-8ES5zAbHTjBNuhJUa3uTtD.png&title=My+Loyalty+Pool&expired=false&theme=%7B%22elements%22%3A%7B%22btnBg%22%3A%7B%22label%22%3A%22Button%22%2C%22color%22%3A%22%235942c1%22%7D%2C%22btnText%22%3A%7B%22label%22%3A%22Button+Text%22%2C%22color%22%3A%22%23FFFFFF%22%7D%2C%22text%22%3A%7B%22label%22%3A%22Text%22%2C%22color%22%3A%22%23FFFFFF%22%7D%2C%22bodyBg%22%3A%7B%22label%22%3A%22Background%22%2C%22color%22%3A%22%23241956%22%7D%2C%22cardBg%22%3A%7B%22label%22%3A%22Card%22%2C%22color%22%3A%22%2331236d%22%7D%2C%22cardText%22%3A%7B%22label%22%3A%22Card+Text%22%2C%22color%22%3A%22%23FFFFFF%22%7D%2C%22navbarBg%22%3A%7B%22label%22%3A%22Navigation%22%2C%22color%22%3A%22%2331236d%22%7D%2C%22launcherBg%22%3A%7B%22label%22%3A%22Launcher%22%2C%22color%22%3A%22%235942c1%22%7D%2C%22launcherIcon%22%3A%7B%22label%22%3A%22Launcher+Icon%22%2C%22color%22%3A%22%23ffffff%22%7D%7D%2C%22colors%22%3A%7B%22accent%22%3A%7B%22label%22%3A%22Accent%22%2C%22color%22%3A%22%2398D80D%22%7D%2C%22success%22%3A%7B%22label%22%3A%22Success%22%2C%22color%22%3A%22%2328a745%22%7D%2C%22warning%22%3A%7B%22label%22%3A%22Warning%22%2C%22color%22%3A%22%23ffe500%22%7D%2C%22danger%22%3A%7B%22label%22%3A%22Danger%22%2C%22color%22%3A%22%23dc3545%22%7D%2C%22info%22%3A%7B%22label%22%3A%22Info%22%2C%22color%22%3A%22%2317a2b8%22%7D%7D%7D';
    const CLAIM_URL =
        'https://localhost:8080/644f689bf62a81e0f69dbf6a/c/89e03c37-cad5-44e4-bc04-a6a513d8733c?id=644f689bf62a81e0f69dbf6a&origin=https%3A%2F%2Flocalhost%3A8081&chainId=31337&theme=%7B%22elements%22%3A%7B%22btnBg%22%3A%7B%22label%22%3A%22Button%22%2C%22color%22%3A%22%235942c1%22%7D%2C%22btnText%22%3A%7B%22label%22%3A%22Button+Text%22%2C%22color%22%3A%22%23FFFFFF%22%7D%2C%22text%22%3A%7B%22label%22%3A%22Text%22%2C%22color%22%3A%22%23FFFFFF%22%7D%2C%22bodyBg%22%3A%7B%22label%22%3A%22Background%22%2C%22color%22%3A%22%23241956%22%7D%2C%22cardBg%22%3A%7B%22label%22%3A%22Card%22%2C%22color%22%3A%22%2331236d%22%7D%2C%22cardText%22%3A%7B%22label%22%3A%22Card+Text%22%2C%22color%22%3A%22%23FFFFFF%22%7D%2C%22navbarBg%22%3A%7B%22label%22%3A%22Navigation%22%2C%22color%22%3A%22%2331236d%22%7D%2C%22launcherBg%22%3A%7B%22label%22%3A%22Launcher%22%2C%22color%22%3A%22%235942c1%22%7D%2C%22launcherIcon%22%3A%7B%22label%22%3A%22Launcher+Icon%22%2C%22color%22%3A%22%23ffffff%22%7D%7D%2C%22colors%22%3A%7B%22accent%22%3A%7B%22label%22%3A%22Accent%22%2C%22color%22%3A%22%2398D80D%22%7D%2C%22success%22%3A%7B%22label%22%3A%22Success%22%2C%22color%22%3A%22%2328a745%22%7D%2C%22warning%22%3A%7B%22label%22%3A%22Warning%22%2C%22color%22%3A%22%23ffe500%22%7D%2C%22danger%22%3A%7B%22label%22%3A%22Danger%22%2C%22color%22%3A%22%23dc3545%22%7D%2C%22info%22%3A%7B%22label%22%3A%22Info%22%2C%22color%22%3A%22%2317a2b8%22%7D%7D%7D&logoUrl=https%3A%2F%2Flocal-thx-storage-bucket.s3.eu-west-3.amazonaws.com%2Flogo-padding-8ES5zAbHTjBNuhJUa3uTtD.png&title=My+Loyalty+Pool&expired=false';
    const RECEIVER = '0x51193777AfF37caA0E1d5C26aBCaE3f29af5510D';

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
