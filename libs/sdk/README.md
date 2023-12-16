# THX Network JavaScript SDK

This SDK contains a client class that simplifies interactions with THX Network API's. Configure your digital assets in your dashboard and use the SDK to integrate distribution of those assets into your application.

## Prerequisites

1. [Sign up](https://dashboard.thx.network)
2. Create a campaign
3. Register API keys

## Usage

Meant for user authentication in web applications. The [OAuth2 authorization_code](https://datatracker.ietf.org/doc/html/rfc6749#section-1.3.1) grant will be used for this.

```javascript
const authorizationEndpoint = 'http://auth.thx.network/authorize';
const clientId = 'your-client-id'; // Create one at Campaign -> Developer -> API Keys
const redirectUri = 'your-redirect-uri'; // Eg. https://localhost:8080/callback
const scope =
    'openid offline_access account:read account:write erc20:read erc721:read erc1155:read point_balances:read referral_rewards:read point_rewards:read wallets:read wallets:write pool_subscription:read pool_subscription:write claims:read';

// Redirect user to authorization endpoint
const authUrl = new URL(authorizationEndpoint);
authUrl.searchParams.append('client_id', clientId);
authUrl.searchParams.append('redirect_uri', redirectUri);
authUrl.searchParams.append('scope', scope);
authUrl.searchParams.append('response_type', 'code');
window.location.href = authUrl;

// Once user is redirected back to your application with the authorization code
const authorizationCode = 'code-received-from-redirect';
const tokenRequestData = {
    grant_type: 'authorization_code',
    code: authorizationCode,
    client_id: clientId,
    redirect_uri: redirectUri,
};

// Exchange authorization code for access token
fetch('http://auth.thx.network/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify(tokenRequestData),
})
    .then((response) => response.json())
    .then((tokenResponse) => {
        console.log('Access Token:', tokenResponse.access_token);
    })
    .catch((error) => {
        console.error('Token exchange error:', error);
    });
```

## Usage

```javascript
import { THXClient, THXClientOptions } from '@thxprotocol/sdk';

const poolId = '6571c9c6b7d775decb45a8f0';
const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Obtain from auth.thx.network
const options: THXClientOptions = {
    url: 'http://api.thx.network', // Required
    poolId, // Optional
    apiKey, // Optional
    accessToken, // Optional
};
const client = new THXClient(options);

// Optional usage if not set through constructor
client.setPoolId(poolId);
client.setAccessToken(accessToken);
```

## Resources

### Account

```javascript
// Get Account
await client.account.get();

// Update Account
await client.account.patch({
    username: '';
    firstName: '';
    lastName: '';
    profileImg: ''; // Absolute URL
    email: '';
});

// Get Point Balance
await client.pointBalance.list();
```

### Quests

```javascript
// List Quests
await client.quests.list();

// Complete Quests
await client.quests.daily.complete(uuid, {
    sub: '',
});
await client.quests.invite.complete(uuid, {
    sub: '',
});
await client.quests.social.complete(id);
await client.quests.custom.complete(id);
await client.quests.web3.complete(id);
```

### Rewards

```javascript
// List Rewards
await client.rewards.list();

// Get Rewards
await client.rewards.coin.get(uuid);
await client.rewards.nft.get(uuid);
await client.rewards.custom.get(uuid);
await client.rewards.coupon.get(uuid);

// Redeem Rewards
await client.rewards.coin.redemption.post(uuid);
await client.rewards.nft.redemption.post(uuid);
await client.rewards.custom.redemption.post(uuid);
await client.rewards.coupon.redemption.post(uuid);
```

### Wallet

```javascript
await client.erc20.list({ chainId: 137 });
await client.erc721.list({ chainId: 137 });
await client.erc1155.list({ chainId: 137 });
```
