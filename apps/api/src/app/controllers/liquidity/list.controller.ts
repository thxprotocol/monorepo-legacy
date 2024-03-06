import { Request, Response } from 'express';

export const validation = [];

export const controller = async (req: Request, res: Response) => {
    res.status(200).json();
};
export default { controller, validation };
