import { Account } from '@thxnetwork/auth/models/Account';

const controller = async (req, res) => {
    const account = await Account.findById(req.auth.sub);
    res.json(account);
};

export default { controller };
