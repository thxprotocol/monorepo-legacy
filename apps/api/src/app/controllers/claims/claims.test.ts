import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, NFTVariant, RewardVariant } from '@thxnetwork/common/enums';
import { sub, dashboardAccessToken, widgetAccessToken, widgetAccessToken2 } from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import {
    PoolDocument,
    ERC721Metadata,
    ERC721MetadataDocument,
    QRCodeEntryDocument,
    ERC721Document,
} from '@thxnetwork/api/models';
import { IPFS_BASE_URL } from '@thxnetwork/api/config/secrets';
import { safeVersion } from '@thxnetwork/api/services/ContractService';
import { getProvider } from '@thxnetwork/api/util/network';
import { poll } from '@thxnetwork/api/util/polling';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import SafeService from '@thxnetwork/api/services/SafeService';

const user = request.agent(app);

describe('QR Codes', () => {
    let poolId: string,
        pool: PoolDocument,
        erc721: ERC721Document,
        metadata: ERC721MetadataDocument,
        wallet: WalletDocument,
        claims: QRCodeEntryDocument[];
    const config = {
            title: '',
            description: '',
            pointPrice: 0,
            limit: 0,
            claimAmount: 10,
            variant: RewardVariant.NFT,
        },
        chainId = ChainId.Hardhat;

    beforeAll(async () => {
        await beforeAllCallback();

        pool = await PoolService.deploy(sub, 'My Reward Campaign');
        poolId = String(pool._id);

        const safe = await SafeService.create({ sub, chainId, safeVersion, poolId });

        // Wait for campaign safe to be deployed
        const { web3 } = getProvider(ChainId.Hardhat);
        await poll(
            () => web3.eth.getCode(safe.address),
            (data: string) => data === '0x',
            1000,
        );

        erc721 = await ERC721Service.deploy({
            variant: NFTVariant.ERC721,
            sub,
            chainId,
            name: 'Test Collection',
            symbol: 'TST',
            description: '',
            baseURL: 'https://example.com',
            archived: false,
            logoImgUrl: 'https://img.url',
        });
        metadata = await ERC721Metadata.create({
            erc721Id: String(erc721._id),
            name: 'Token Silver',
            image: IPFS_BASE_URL + 'abcdef',
            imageUrl: 'https://image.com/image.jpg',
            description: 'Lorem ipsum dolor sit amet',
            externalUrl: 'https://example.com',
        });
        wallet = await SafeService.findOne({ sub });
    });
    afterAll(afterAllCallback);

    describe('PointPrice = 100', () => {
        it('POST /rewards/:poolId/rewards/:variant', (done) => {
            user.post(`/v1/pools/${poolId}/rewards/${RewardVariant.NFT}`)
                .set({ Authorization: dashboardAccessToken })
                .send({
                    ...config,
                    poolId,
                    erc721Id: erc721._id,
                    metadataId: metadata._id,
                    pointPrice: 100,
                })
                .expect((res: request.Response) => {
                    console.log(res.body);
                    expect(res.body[0].qrcodes).toHaveLength(config.claimAmount);
                    claims = res.body[0].qrcodes;
                })
                .expect(201, done);
        });

        it('should return a 200 for first claim attempt by wallet 0', (done) => {
            user.get(`/v1/qr-codes/${claims[0].uuid}`)
                .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
                .expect(200, done);
        });

        it('should return a 403 for claim', (done) => {
            user.post(`/v1/qr-codes/${claims[0].uuid}/collect`)
                .query({ walletId: String(wallet._id) })
                .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.error.message).toBe('This perk should be redeemed with points.');
                })
                .expect(403, done);
        });
    });

    describe('PointPrice = 0', () => {
        it('POST /rewards', (done) => {
            user.post(`/v1/pools/${poolId}/rewards/${RewardVariant.NFT}`)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    ...config,
                    erc721Id: erc721._id,
                    metadataIds: metadata._id,
                })
                .expect((res: request.Response) => {
                    expect(res.body[0].claims).toHaveLength(config.claimAmount);
                    claims = res.body[0].claims;
                })
                .expect(201, done);
        });

        it('200 with no error', (done) => {
            user.get(`/v1/claims/${claims[0].uuid}`)
                .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
                .expect(({ body }: request.Response) => {
                    expect(body.claim).toBeDefined();
                    expect(body.pool).toBeDefined();
                    expect(body.perk).toBeDefined();
                    expect(body.erc721).toBeDefined();
                    expect(body.metadata).toBeDefined();
                    // No error
                    expect(body.error).toBeUndefined();
                })
                .expect(200, done);
        });

        it('First attempt claim should succeed', (done) => {
            user.post(`/v1/claims/${claims[0].uuid}/collect`)
                .query({ walletId: String(wallet._id) })
                .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
                .expect(({ body }: request.Response) => {
                    expect(body.erc721).toBeDefined();
                    expect(body.claim).toBeDefined();
                    expect(body.payment).toBeDefined();
                    expect(body.token).toBeDefined();
                    expect(body.metadata).toBeDefined();
                    expect(body.reward).toBeDefined();
                })
                .expect(200, done);
        });

        it('200 with no error.', (done) => {
            user.get(`/v1/claims/${claims[0].uuid}`)
                .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
                .expect(({ body }: request.Response) => {
                    expect(body.claim).toBeDefined();
                    expect(body.pool).toBeDefined();
                    expect(body.perk).toBeDefined();
                    expect(body.erc721).toBeDefined();
                    expect(body.metadata).toBeDefined();
                    // Should show error
                    expect(body.error).toBe('This NFT is claimed already.');
                })
                .expect(200, done);
        });

        it('Second attempt same claim should fail.', (done) => {
            user.post(`/v1/claims/${claims[0].uuid}/collect`)
                .query({ walletId: String(wallet._id) })
                .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
                .expect(({ body }: request.Response) => {
                    expect(body.error.message).toBe('This NFT is claimed already.');
                })
                .expect(403, done);
        });

        it('First attempt other account should also fail', (done) => {
            user.post(`/v1/claims/${claims[0].uuid}/collect`)
                .query({ walletId: String(wallet._id) })
                .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken2 })
                .expect(({ body }: request.Response) => {
                    expect(body.error.message).toBe('This NFT is claimed already.');
                })
                .expect(403, done);
        });

        it('First attempt other claim for other account should succeed', (done) => {
            user.post(`/v1/claims/${claims[1].uuid}/collect`)
                .query({ walletId: String(wallet._id) })
                .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken2 })
                .expect(({ body }: request.Response) => {
                    expect(body.erc721).toBeDefined();
                    expect(body.claim).toBeDefined();
                    expect(body.payment).toBeDefined();
                    expect(body.token).toBeDefined();
                    expect(body.metadata).toBeDefined();
                    expect(body.reward).toBeDefined();
                })
                .expect(200, done);
        });
    });
});
