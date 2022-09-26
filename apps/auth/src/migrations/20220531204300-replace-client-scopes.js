module.exports = {
    async up(db) {
        // ADMIN SCOPE
        let oldScope = 'openid admin';
        let newScope =
            'openid account:read account:write pools:read pools:write rewards:read members:read members:write withdrawals:read withdrawals:write';
        await db
            .collection('client')
            .updateMany({ 'payload.scope': oldScope }, { $set: { 'payload.scope': newScope } });

        // DASHBOARD SCOPE
        oldScope = 'openid user dashboard';
        newScope =
            'openid account:read pools:read pools:write erc20:read erc20:write erc721:read erc721:write rewards:read rewards:write withdrawals:read deposits:read deposits:write promotions:read promotions:write widgets:write widgets:read';
        await db
            .collection('client')
            .updateMany({ 'payload.scope': oldScope }, { $set: { 'payload.scope': newScope } });

        // CMS SCOPE
        oldScope = 'openid cms';
        newScope = 'openid metrics:read';
        await db
            .collection('client')
            .updateMany({ 'payload.scope': 'openid cms' }, { $set: { 'payload.scope': newScope } });

        // WALLET SCOPE
        oldScope = 'openid user deposits:read deposits:write';
        newScope =
            'openid rewards:read erc20:read erc721:read withdrawals:read withdrawals:write deposits:read deposits:write account:read account:write memberships:read memberships:write promotions:read relay:write';
        await db
            .collection('client')
            .updateMany({ 'payload.scope': oldScope }, { $set: { 'payload.scope': newScope } });
    },
};
