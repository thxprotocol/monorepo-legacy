import express from 'express';
import * as ListInvoices from './list.controller';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', guard.check(['pools:read']), assertRequestInput(ListInvoices.validation), ListInvoices.controller);

export default router;
