import { Response, Request } from 'express';
import { name, version, license } from '../../../../package.json';

export const getHealth = (_req: Request, res: Response) => {
    const jsonData = {
        name,
        version,
        license,
    };

    res.header('Content-Type', 'application/json').send(JSON.stringify(jsonData, null, 4));
};
