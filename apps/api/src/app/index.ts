import 'express-async-errors';
import '@thxnetwork/api/config/openapi';
import axios from 'axios';
import axiosBetterStacktrace from 'axios-better-stacktrace';
import compression from 'compression';
import express from 'express';
import lusca from 'lusca';
import router from '@thxnetwork/api/controllers';
import db from '@thxnetwork/api/util/database';
import morganBody from 'morgan-body';
import { MONGODB_URI, NODE_ENV, PORT, VERSION } from '@thxnetwork/api/config/secrets';
import { corsHandler, errorLogger, errorNormalizer, errorOutput, notFoundHandler } from '@thxnetwork/api/middlewares';
import { assetsPath } from './util/path';

axiosBetterStacktrace(axios);

const app = express();

db.connect(MONGODB_URI);

app.set('trust proxy', true);
app.set('port', PORT);
app.use(compression());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use(express.static(assetsPath, { maxAge: 31557600000 }));
app.use(express.json());

morganBody(app, { logResponseBody: NODE_ENV !== 'production' });

app.use(express.urlencoded({ extended: true }));
app.use(corsHandler);
app.use(`/${VERSION}`, router);
app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorNormalizer);
app.use(errorOutput);

export default app;
