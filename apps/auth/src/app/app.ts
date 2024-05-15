import 'express-async-errors';

import axios from 'axios';
import axiosBetterStacktrace from 'axios-better-stacktrace';
import compression from 'compression';
import express from 'express';
import expressEJSLayouts from 'express-ejs-layouts';
import path from 'path';
import db from './util/database';
import morgan from './middlewares/morgan';
import morganBody from 'morgan-body';
import { xssProtection } from 'lusca';
import { DASHBOARD_URL, GTM, MONGODB_URI, NODE_ENV, PORT, PUBLIC_URL, WIDGET_URL } from './config/secrets';
import RouterRoot from './controllers';
import { corsHandler, errorLogger, errorNormalizer, errorOutput, notFoundHandler } from './middlewares';
import { helmetInstance } from './util/helmet';
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
app.use(morgan);

morganBody(app, {
    logRequestBody: NODE_ENV === 'development',
    logResponseBody: false, // NODE_ENV === 'development',
    skip: () => NODE_ENV === 'test',
});

app.use(expressEJSLayouts);
app.use(xssProtection(true));
app.use(express.static(assetsPath));
app.use('/', RouterRoot);
app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorNormalizer);
app.use(errorOutput);

app.locals = Object.assign(app.locals, {
    gtm: GTM,
    dashboardUrl: DASHBOARD_URL,
    widgetUrl: WIDGET_URL,
    publicUrl: PUBLIC_URL,
    deployedAt: String(Date.now()),
});

export default app;
