import express from 'express';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import * as ReadBalances from './get.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', guard.check(['erc1155:read']), assertRequestInput(ReadBalances.validation), ReadBalances.controller);

export default router;
