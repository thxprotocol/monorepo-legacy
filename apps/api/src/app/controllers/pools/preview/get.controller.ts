import { API_URL, DASHBOARD_URL } from '@thxnetwork/api/config/secrets';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [];

const controller = async (req, res) => {
    const redirectUrl = new URL(DASHBOARD_URL);
    redirectUrl.pathname = `/preview/${req.params.id}`;

    const imageUrl = new URL(API_URL);
    imageUrl.pathname = `/v1/pools/preview/default/${req.params.id}.png`;

    // { name: 'title', content: 'Title' },
    // { vmid: 'description', name: 'description', content: 'description' },
    // { name: 'keywords', content: 'test test' },
    // { name: 'twitter:card', content: 'card' },
    // { name: 'twitter:site', content: PUBLIC_URL },
    // { name: 'twitter:creator', content: '@thxnetwork' },
    // { name: 'twitter:title', content: 'Titlte' },
    // { name: 'twitter:description', content: 'description' },
    // { name: 'twitter:image:alt', content: 'image alt' },

    // { name: 'og:title', content: 'title' },
    // { name: 'og:description', content: 'lorem ipsum' },
    // { name: 'og:type', content: 'type' },
    // { name: 'og:site_name', content: 'Campaign' },
    // { name: 'og:url', content: this.$route.fullPath },
    // { name: 'og:image', content: `${API_URL}/pools/preview/default/${poolId}.png` },

    const pool = await PoolService.getById(req.params.id);

    res.send(`
<!DOCTYPE html>
<html>
<head>

<meta property="og:title" content="${pool.settings.title}">
<meta property="og:description" content="${pool.settings.description}">
<meta property="og:url" content="${redirectUrl}">
<meta property="og:image" content="${imageUrl}">

<meta name="twitter:card" content="${imageUrl}">
<meta name="twitter:site" content="@thxprotocol">
<meta name="twitter:title" content="${pool.settings.title}">
<meta name="twitter:description" content="${pool.settings.description}">
<meta name="twitter:image" content="${imageUrl}">

</head>
<body>
<script>
    window.location.href = "${redirectUrl}"
</script>
</body>
</html>
`);
};

export default { controller, validation };
