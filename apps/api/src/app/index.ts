import 'express-async-errors';
import axios from 'axios';
import axiosBetterStacktrace from 'axios-better-stacktrace';
import compression from 'compression';
import express, { Request } from 'express';
import lusca from 'lusca';
import router from '@thxnetwork/api/controllers';
import db from '@thxnetwork/api/util/database';
import morganBody from 'morgan-body';
import { MONGODB_URI, NODE_ENV, PORT, VERSION } from '@thxnetwork/api/config/secrets';
import { corsHandler, errorLogger, errorNormalizer, errorOutput, notFoundHandler } from '@thxnetwork/api/middlewares';
import { assetsPath } from './util/path';
import morgan from './middlewares/morgan';

axiosBetterStacktrace(axios);

const app = express();

db.connect(MONGODB_URI);

app.set('trust proxy', true);
app.set('port', PORT);
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use(express.static(assetsPath));
app.use(
    express.json({
        verify(req: Request, res, buf, encoding: BufferEncoding) {
            if (buf && buf.length) {
                req.rawBody = buf.toString(encoding || 'utf8');
            }
        },
    }),
);

app.use(morgan);

morganBody(app, {
    logRequestBody: NODE_ENV === 'development',
    logResponseBody: false,
    skip: () => ['test', 'production'].includes(NODE_ENV),
});

app.use(express.urlencoded({ extended: true }));
app.use(corsHandler);
app.use(`/${VERSION}`, router);
app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorNormalizer);
app.use(errorOutput);
app.use(compression());

export default app;
