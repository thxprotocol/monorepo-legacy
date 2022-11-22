import 'express-async-errors';

import axios from 'axios';
import axiosBetterStacktrace from 'axios-better-stacktrace';
import compression from 'compression';
import express from 'express';
import expressEJSLayouts from 'express-ejs-layouts';
import { xssProtection } from 'lusca';
import path from 'path';

import { DASHBOARD_URL, GTM, MONGODB_URI, PORT, PUBLIC_URL, WALLET_URL } from './config/secrets';
import { mainRouter } from './controllers';
import { corsHandler, errorLogger, errorNormalizer, errorOutput, notFoundHandler } from './middlewares';
import db from './util/database';
import { helmetInstance } from './util/helmet';
import { requestLogger } from './util/logger';
import { assetsPath } from './util/path';

axiosBetterStacktrace(axios);

const app = express();

db.connect(MONGODB_URI);

app.set('port', PORT);
app.set('trust proxy', true);
app.set('layout', './layouts/default');
app.set('view engine', 'ejs');
app.set('views', path.join(assetsPath, 'views'));
app.use(compression());
app.use(helmetInstance);
app.use(corsHandler);
app.use(requestLogger);
app.use(expressEJSLayouts);
app.use(xssProtection(true));
app.use(express.static(assetsPath, { maxAge: 31557600000 }));
app.use('/', mainRouter);
app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorNormalizer);
app.use(errorOutput);

app.locals = Object.assign(app.locals, {
    gtm: GTM,
    dashboardUrl: DASHBOARD_URL,
    walletUrl: WALLET_URL,
    publicUrl: PUBLIC_URL,
});

export default app;
