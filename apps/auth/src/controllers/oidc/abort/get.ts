import { Request, Response } from 'express';
import { oidc } from '../../../util/oidc';

async function controller(req: Request, res: Response) {
    const result = {
        error: 'access_denied',
        error_description: 'End-User aborted interaction',
    };
    await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
}

export default { controller };
