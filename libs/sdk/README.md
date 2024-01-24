# THX Network JS SDK

This SDK contains API wrappers and an OIDC OAuth manager to simplify access to THX API resources.

## Prerequisites

1. [Sign up for an account](https://dashboard.thx.network/)
2. Create API keys (Developer -> API)
3. Save your `clientId` and `clientSecret`

## SDK Contents

-   [1. THXWidget](#1-thxwidget)

    -   [1.1 ContainerSelector](#11-containerselector)
    -   [1.2 Identity](#12-identity)

-   [2. THXAPIClient](#2-thxapiclient)

    -   [2.1 Identities](#21-identities)
    -   [2.2 Events](#22-events)

-   [3. THXBrowserClient](#3-thxbrowserclient)

    -   [3.1 Account](#31-account)
    -   [3.2 Quests](#32-quests)
    -   [3.3 Rewards](#33-rewards)
    -   [3.4 Wallet](#34-wallet)

## 1. THXWidget

Meant for loading the HTML widget in a website using JavaScript.

```javascript
import { THXWidget, THXWidgetOptions } from '@thxnetwork/sdk';

const options: THXWidgetOptions = {
    campaignId: '6571c9c6b7d775decb45a8f0',
    containerSelector: '#your-html-container', // Optional
    identity: '36d33a59-5398-463a-ac98-0f7d9b201648', // Optional
};
THXWidget.create(options);
```

### 1.1 ContainerSelector

Providing a `containerSelector` is optional and will inject the application in a given HTML element. Make sure to provide CSS styles for proper dimensions within your page.

```html
<div id="your-html-container" style="height: 750px;"></div>
```

No messagbox, launcher and notification elements will be injected if a container selector is specified!

### 1.2 Identity

Providing an identity is optional and alternatively you can set an identity at a later moment, for example after successful authentication with your app.

```javascript
window.THXWidget.setIdentity('36d33a59-5398-463a-ac98-0f7d9b201648');
```

## 2. THXAPIClient

Meant for JavaScript backend applications.

```javascript
import { THXAPIClient, THXAPIClientOptions } from '@thxnetwork/sdk';

const options: THXAPIClientOptions = {
    campaignId: '65b0e27845c63cd18e0ab4a6',
    clientId: 'msuq4Znuv3q8hLf7ATnlP',
    clientSecret: 'YP_k8_LnPG58LHqzWGxg3EMBBGVwwJUmqsuQZdoMtEAD-85hJwRt2vxfev23T92h727bDwCqh3cIkx6meT0xxg',
};
const thx = new THXAPIClient(options);
```

### 2.1 Identities

Identities are used to connect THX accounts to users in your database.

```javascript
const identity = await thx.identity.create();
// 36d33a59-5398-463a-ac98-0f7d9b201648
```

### 2.2 Events

Events can be used to add requirements for Daily, Invite and Custom Quests.

```javascript
thx.events.create({ name: 'level_up', identity: '36d33a59-5398-463a-ac98-0f7d9b201648' });
```

### 2.3 Quests

Quests can be managed programatically. Specify `content` and `contentMetadata` according to the requirements in order to generate proper card previews.

#### Twitter Post Previews

Use this `content` and `contentMetadata` for these `interaction` variants: `QuestRequirement.TwitterLike`, `QuestRequirement.TwitterRetweet`, `QuestRequirement.TwitterLikeRetweet`.

```javascript
const interaction = QuestRequirement.TwitterLikeRetweet;
const content = '46927555';
const contentMetadata = {
    url: 'https://twitter.com/twitter/status/1603121182101970945',
    username: 'johndoe',
    name: 'John Doe',
    text: '✨ Loyalty Networks are here✨ #fintech meets #loyalty',
    minAmountFollowers: 123,
};
```

#### Twitter User Previews

Use this `content` and `contentMetadata` for these `interaction` variants: `QuestRequirement.TwitterFollow`.

```javascript
const interaction = QuestRequirement.TwitterFollow;
const content = '13241234';
const contentMetadata = {
    id: 46927555,
    name: 'John doe',
    profileImgUrl: 'https://picsum.com/avatar.jpg',
    username: 'johndoe',
    minAmountFollowers: 123,
};
```

#### Twitter Message Preview

Use this `content` and `contentMetadata` for these `interaction` variants: ` QuestRequirement.TwitterMessage`,

```javascript
const interaction = QuestRequirement.TwitterMessage;
const content = '✨ Loyalty Networks are here✨ #fintech meets #loyalty';
const contentMetadata = {
    minFollowersCount: 123,
};
```

#### Create Twitter Quest

```javascript
thx.campaigns.quests.create({
    variant: QuestVariant.Twitter,
    title: 'Farm along!',
    description: 'Get these pointzz...',
    amount: 123,
    isPublished: true,
    interaction,
    content,
    contentMetadata,
});
```

## 3. THXBrowserClient

Meant for JavaScript browser applications.

```javascript
import { THXBrowserClient, THXBrowserClientOptions } from '@thxnetwork/sdk';

const options: THXBrowserClientOptions = {
    clientId: 'chyBeltL7rmOeTwVu',
    clientSecret: 'q4ilZuGA4VPtrGhXug3i5taXrvDtidrzyv-gJN3yVo8T2stL6RwYQjqRoK-iUiAGGvhbG_F3TEFFuD_56Q065Q'
    redirectUri: 'https://www.yourdomain.com/auth-callback'
    campaignId: '6571c9c6b7d775decb45a8f0', // Optional
};
const thx = new THXBrowserClient(options);
```

Alternatively you can set the `campaignId` at a later moment, for example after obtaining it from a url or database. The campaign is used to scope API requests to a campaign that you own.

```javascript
thx.setCampaignId('6571c9c6b7d775decb45a8f0');
```

### 3.1 Account

Get account info for the authenticated user and obtain it's current point balance in your campaign.

```javascript
// Get Account
await client.account.get();

// Update Account
await client.account.patch({
    username: '';
    firstName: '';
    lastName: '';
    email: '';
    profileImg: ''; // Absolute URL
});

// Get Point Balance
await client.pointBalance.list();
```

### 3.2 Quests

List and complete quests in your campaign.

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

### 3.3 Rewards

List and redeem rewards in your campaign.

```javascript
// List Rewards
await thx.rewards.list();

// Get Rewards
await thx.rewards.coin.get(uuid);
await thx.rewards.nft.get(uuid);
await thx.rewards.custom.get(uuid);
await thx.rewards.coupon.get(uuid);

// Redeem Rewards
await thx.rewards.coin.redemption.post(uuid);
await thx.rewards.nft.redemption.post(uuid);
await thx.rewards.custom.redemption.post(uuid);
await thx.rewards.coupon.redemption.post(uuid);
```

### 3.4 Wallet

List tokens held in your accounts wallet.

```javascript
await thx.erc20.list({ chainId: 137 });
await thx.erc721.list({ chainId: 137 });
await thx.erc1155.list({ chainId: 137 });
```
