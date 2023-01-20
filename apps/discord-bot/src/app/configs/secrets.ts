const required = ['TOKEN', 'CLIENT_ID', 'CLIENT_SECRET', 'AUTH_URL'];

required.forEach((value: string) => {
    if (!process.env[value]) {
        console.log(`Set ${value} environment variable.`);
        process.exit(1);
    }
});

export const TOKEN = process.env['TOKEN'];
export const CLIENT_ID = process.env['CLIENT_ID'];
export const CLIENT_SECRET = process.env['CLIENT_SECRET'];
export const AUTH_URL = process.env['AUTH_URL'];
