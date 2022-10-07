import helmet from 'helmet';
// import { AUTH_URL, DASHBOARD_URL, WALLET_URL } from './secrets';

export const helmetInstance = helmet({
    // contentSecurityPolicy: {
    //     directives: {
    //         defaultSrc: [AUTH_URL, "'unsafe-eval'", "'unsafe-inline'"],
    //         frameSrc: [AUTH_URL, WALLET_URL, DASHBOARD_URL],
    //         frameAncestors: [WALLET_URL, DASHBOARD_URL],
    //         fontSrc: ['https://fonts.gstatic.com', 'https://ka-f.fontawesome.com/'],
    //         connectSrc: ['https://ka-f.fontawesome.com'],
    //         scriptSrcElem: [
    //             AUTH_URL,
    //             'https://www.googletagmanager.com',
    //             'https://kit.fontawesome.com',
    //             'https://cdn.jsdelivr.net',
    //             'https://unpkg.com/',
    //             'https://cdnjs.cloudflare.com',
    //             "'sha256-PEI/gdNohg23HbZboqauC7uLjfrpcON9Z4W9IurYRxk='",
    //             "'sha256-jOpZSqrqP85EQ9xzce9PQ0EFR3DhpJcbc+vVR1OQLHQ='",
    //             "'sha256-5+pexDB9ERu/BGJRRg/9bZuuZwHoAYgdA9L6UuOaIPY='",
    //             "'sha256-tHn9v4E9xZmG7Eh4CSF7CHyPU7kSwiu32J8PimHwftU='",
    //         ],
    //         styleSrcElem: [
    //             AUTH_URL,
    //             'https://fonts.googleapis.com',
    //             'https://ka-f.fontawesome.com',
    //             "'sha256-uCITVBkyNmwuSQXzSNUuRx7G7+1kS2zWJ9SjHF0W2QA='",
    //             "'sha256-bepHRYpM181zEsx4ClPGLgyLPMyNCxPBrA6m49/Ozqg='",
    //             "'sha256-ZL58hL5KbUHBRnMK797rN7IR+Tg9Aw61ddJ/rmxn1KM='",
    //             "'sha256-75mE4wfpMmhCBnDZSF3PLGDQFzUteIHYrgFoOGlCMQw='",
    //         ],
    //     },
    // },
    contentSecurityPolicy: false,
    hidePoweredBy: true,
    frameguard: false,
    referrerPolicy: {
        policy: ['origin'],
    },
});
