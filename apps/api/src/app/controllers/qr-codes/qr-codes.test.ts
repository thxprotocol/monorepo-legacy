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
    RewardNFTDocument,
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
        reward: RewardNFTDocument,
        metadata: ERC721MetadataDocument,
        wallet: WalletDocument,
        qrcodes: QRCodeEntryDocument[];

    const chainId = ChainId.Hardhat;

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

    it('POST /pools/:poolId/rewards/:variant', (done) => {
        user.post(`/v1/pools/${poolId}/rewards/${RewardVariant.NFT}`)
            .set({ Authorization: dashboardAccessToken })
            .send({
                title: '',
                description: '',
                pointPrice: 0,
                limit: 0,
                variant: RewardVariant.NFT,
                erc721Id: erc721._id,
                metadataId: metadata._id,
            })
            .expect(({ body }: request.Response) => {
                expect(body._id).toBeDefined();
                reward = body;
            })
            .expect(201, done);
    });

    it('POST /qr-codes', (done) => {
        user.post(`/v1/qr-codes`)
            .set({ Authorization: dashboardAccessToken })
            .send({
                rewardId: reward._id,
                claimAmount: 10,
                redirectURL: 'https://example.com/redirect',
            })
            .expect(({ body }: request.Response) => {
                expect(body).toHaveLength(10);
            })
            .expect(201, done);
    });

    it('GET /qr-codes?rewardId=:rewardId&page=:page&limit=:limit', (done) => {
        user.get(`/v1/qr-codes`)
            .set({ Authorization: dashboardAccessToken })
            .query({
                rewardId: reward._id,
                page: 1,
                limit: 15,
            })
            .expect(({ body }: request.Response) => {
                expect(body.total).toBe(10);
                expect(body.results).toHaveLength(10);
                qrcodes = body.results;
            })
            .expect(200, done);
    });

    it('GET /qr-codes/:uuid', (done) => {
        user.get(`/v1/qr-codes/${qrcodes[0].uuid}`)
            .expect(({ body }: request.Response) => {
                expect(body.entry).toBeDefined();
                expect(body.erc721).toBeDefined();
                expect(body.metadata).toBeDefined();
            })
            .expect(200, done);
    });

    it('PATCH /qr-codes/:uuid should succeed', (done) => {
        user.patch(`/v1/qr-codes/${qrcodes[0].uuid}`)
            .query({ walletId: String(wallet._id) })
            .set({ Authorization: widgetAccessToken })
            .expect(({ body }: request.Response) => {
                expect(body.erc721).toBeDefined();
                expect(body.entry).toBeDefined();
                expect(body.payment).toBeDefined();
                expect(body.token).toBeDefined();
                expect(body.metadata).toBeDefined();
                expect(body.reward).toBeDefined();
            })
            .expect(200, done);
    });

    it('GET /qr-codes/:uuid should return sub', (done) => {
        user.get(`/v1/qr-codes/${qrcodes[0].uuid}`)
            .set({ Authorization: widgetAccessToken })
            .expect(({ body }: request.Response) => {
                expect(body.entry).toBeDefined();
                expect(body.entry.sub).toBeDefined();
                expect(body.erc721).toBeDefined();
                expect(body.metadata).toBeDefined();
            })
            .expect(200, done);
    });

    it('PATCH /qr-codes/:uuid should fail', (done) => {
        user.patch(`/v1/qr-codes/${qrcodes[0].uuid}`)
            .query({ walletId: String(wallet._id) })
            .set({ Authorization: widgetAccessToken })
            .expect(({ body }: request.Response) => {
                expect(body.error.message).toBe('This NFT is claimed already.');
            })
            .expect(403, done);
    });

    it('PATCH /qr-codes/:uuid from other account should also fail', (done) => {
        user.patch(`/v1/qr-codes/${qrcodes[0].uuid}`)
            .query({ walletId: String(wallet._id) })
            .set({ Authorization: widgetAccessToken2 })
            .expect(({ body }: request.Response) => {
                expect(body.error.message).toBe('This NFT is claimed already.');
            })
            .expect(403, done);
    });

    it('First attempt other claim for other account should succeed', (done) => {
        user.patch(`/v1/qr-codes/${qrcodes[1].uuid}`)
            .query({ walletId: String(wallet._id) })
            .set({ Authorization: widgetAccessToken2 })
            .expect(({ body }: request.Response) => {
                expect(body.entry).toBeDefined();
                expect(body.erc721).toBeDefined();
                expect(body.metadata).toBeDefined();
            })
            .expect(200, done);
    });
});
