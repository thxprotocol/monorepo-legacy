import express from 'express';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import { validateClientAccess } from './utils/validateAccess';
import CreateWidget from './post.controller';
import ReadWidget from './get.controller';
import DeleteWidget from './delete.controller';
import ListWidgets from './list.controller';

const router = express.Router();

router.get('/', guard.check(['widgets:read']), assertRequestInput(ListWidgets.validation), ListWidgets.controller);
router.get(
    '/:uuid',
    guard.check(['widgets:read']),
    assertRequestInput(ReadWidget.validation),
    validateClientAccess,
    ReadWidget.controller,
);
router.post(
    '/',
    guard.check(['widgets:write', 'widgets:read']),
    assertRequestInput(CreateWidget.validation),
    CreateWidget.controller,
);
router.delete(
    '/:uuid',
    guard.check(['widgets:write']),
    assertRequestInput(DeleteWidget.validation),
    validateClientAccess,
    DeleteWidget.controller,
);

export default router;
