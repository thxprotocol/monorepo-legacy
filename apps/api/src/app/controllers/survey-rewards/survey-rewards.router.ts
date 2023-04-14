import { assertAssetPoolOwnership, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListSurveyRewards from './list.controller';
import ReadSurveyRewards from './get.controller';
import CreateSurveyRewards from './post.controller';
import DeleteSurveyRewards from './delete.controller';
import UpdateSurveyRewards from './patch.controller';
import SubmitAttempSurveyRewards from './attemps/post.controller';

const router = express.Router();

router.get('/', guard.check(['survey_rewards:read']), assertAssetPoolOwnership, ListSurveyRewards.controller);
router.get(
    '/:id',
    guard.check(['survey_rewards:read']),
    assertRequestInput(ReadSurveyRewards.validation),
    assertAssetPoolOwnership,
    ReadSurveyRewards.controller,
);
router.post(
    '/',
    guard.check(['survey_rewards:write']),
    assertRequestInput(CreateSurveyRewards.validation),
    assertAssetPoolOwnership,
    CreateSurveyRewards.controller,
);
router.patch(
    '/:id',
    guard.check(['survey_rewards:write']),
    assertRequestInput(UpdateSurveyRewards.validation),
    assertAssetPoolOwnership,
    UpdateSurveyRewards.controller,
);
router.delete(
    '/:id',
    guard.check(['survey_rewards:write']),
    assertRequestInput(DeleteSurveyRewards.validation),
    assertAssetPoolOwnership,
    DeleteSurveyRewards.controller,
);
router.post(
    '/:uuid/attemp',
    //guard.check(['survey_rewards:write']),
    //assertAssetPoolOwnership,
    assertRequestInput(SubmitAttempSurveyRewards.validation),
    SubmitAttempSurveyRewards.controller,
);

export default router;
