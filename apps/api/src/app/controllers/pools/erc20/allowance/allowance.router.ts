import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import * as ListAllowances from './get.controller';
import * as CreateAllowances from './post.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', assertRequestInput(ListAllowances.validation), ListAllowances.controller);
router.post('/', assertRequestInput(CreateAllowances.validation), CreateAllowances.controller);

export default router;
