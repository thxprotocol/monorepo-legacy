const config: any = {
    local: {
        AUTH_URL: 'https://localhost:3030',
        API_URL: 'https://localhost:3000',
    },
    dev: {
        AUTH_URL: 'https://dev.auth.thx.network',
        API_URL: 'https://dev.api.thx.network',
    },
    prod: {
        AUTH_URL: 'https://auth.thx.network',
        API_URL: 'https://api.thx.network',
    },
};

export default config;
