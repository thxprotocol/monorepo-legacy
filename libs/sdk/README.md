# THX Network JavaScript SDK

This SDK contains a client class that simplifies interactions with THX Network API's. Configure your digital assets in your dashboard and use the SDK to integrate distribution of those assets into your application.

## Prerequisites

1. [Sign up for an account](https://dashboard.thx.network/signup)
2. Create a digital asset
3. Deploy a pool
4. Create API credentials

## Grant Types

The OAuth2 server exposes two authorization variants:

### Grant: Authorization Code

Meant for user authentication in a browser application. Upon signin a popup will be shown where the user will be able to authenticate before being redirected to your application and obtain a valid session.

### Grant: Client Credentials

Meant for machine to machine authentication in a server-side application.

## Usage Widget (browser)

You can inject the loyalty widget with a script tag where `639b277c3659345dda9facca` is the ID of your loyalty pool.

```html
<script src="https://api.thx.network/v1/widget/POOL_ID.js"></script>
```

You can also use the THXWidget class from the SDK to load the widget on your page.

```typescript
import { THXWidget } from '@thxnetwork/sdk';

const thxWidget = new THXWidget({
    poolId: 'POOL_ID',
});
```

## Usage SDK (browser)

Sign in and list the tokens owned by this account.

```typescript
import { THXWidget } from '@thxnetwork/sdk';

const thx = new THXClient({
    clientId: 'CLIENT_ID',
    clientSecret: 'CLIENT_SECRET',
    redirectUrl: 'https://localhost:8080',
    scopes: 'openid account:read erc20:read erc721:read',
});

await thx.userManager.cached.signinPopup();

const tokens = await client.erc20.list();
```

## Usage SDK (server)

Transfer tokens from your pool to another account.

```typescript
import { THXWidget } from '@thxnetwork/sdk';

const thx = new THXClient({
    clientId: 'CLIENT_ID',
    clientSecret: 'CLIENT_SECRET',
    scopes: 'openid withdrawals:read withdrawals:write',
});

const withdrawal = await client.withdrawals.post({
    amount: '100000000',
    account: '0xf4b70b3931166B422bBC772a2EafcE8BD5A017F9',
});
```
