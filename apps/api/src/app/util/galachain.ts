import path from 'path';
import { CWD } from '../config/secrets';
import { gcclient, HFClientConfig } from '@gala-chain/client';

enum GalachainRole {
    Partner = 0,
    Curator = 1,
    User = 2,
}

enum GalachainContract {
    PublicKeyContract = 'PublicKeyContract',
    GalaChainToken = 'GalaChainToken',
}

const credentials: { [role: number]: HFClientConfig } = {
    [GalachainRole.Partner]: {
        orgMsp: 'PartnerOrg',
        userId: 'admin',
        userSecret: 'adminpw',
        connectionProfilePath: path.resolve(CWD, 'app/connection-profiles/cpp-partner.json'),
    },
    [GalachainRole.Curator]: {
        orgMsp: 'CuratorOrg',
        userId: 'admin',
        userSecret: 'adminpw',
        connectionProfilePath: path.resolve(CWD, 'app/connection-profiles/cpp-curator.json'),
    },
    [GalachainRole.User]: {
        orgMsp: 'UserOrg',
        userId: 'admin',
        userSecret: 'adminpw',
        connectionProfilePath: path.resolve(CWD, 'app/connection-profiles/cpp-user.json'),
    },
};

const getClient = (role: GalachainRole) => {
    const params = credentials[role];
    return gcclient.forConnectionProfile(params);
};

const getContract = (variant: GalachainContract) => ({
    channelName: 'product-channel',
    chaincodeName: 'basic-product',
    contractName: variant,
});

export { getContract, getClient, GalachainRole, GalachainContract };
