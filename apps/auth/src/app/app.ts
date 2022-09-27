import 'express-async-errors';
import express from 'express';
import compression from 'compression';
import path from 'path';
import db from './util/database';
import expressEJSLayouts from 'express-ejs-layouts';
import axios from 'axios';
import axiosBetterStacktrace from 'axios-better-stacktrace';
import { helmetInstance } from './util/helmet';
import { xssProtection } from 'lusca';
import { requestLogger } from './util/logger';
import { PORT, MONGODB_URI, GTM, DASHBOARD_URL, WALLET_URL, PUBLIC_URL } from './util/secrets';
import { errorLogger, errorNormalizer, errorOutput, notFoundHandler, corsHandler } from './middlewares';
import { mainRouter } from './controllers';

axiosBetterStacktrace(axios);

const app = express();

db.connect(MONGODB_URI);

app.set('port', PORT);
app.set('trust proxy', true);
app.set('layout', './layouts/default');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(compression());
app.use(helmetInstance);
app.use(corsHandler);
app.use(requestLogger);
app.use(expressEJSLayouts);
app.use(xssProtection(true));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
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
