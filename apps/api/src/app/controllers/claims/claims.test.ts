import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, NFTVariant } from '@thxnetwork/types/enums';
import { sub, dashboardAccessToken, widgetAccessToken, widgetAccessToken2 } from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { ClaimDocument } from '@thxnetwork/api/models/Claim';
import { ERC721Document } from '@thxnetwork/api/models/ERC721';
import { ERC721Metadata, ERC721MetadataDocument } from '@thxnetwork/api/models/ERC721Metadata';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { IPFS_BASE_URL } from '@thxnetwork/api/config/secrets';
import { TERC721Perk } from '@thxnetwork/types/interfaces';

const user = request.agent(app);

describe('Claims', () => {
    let poolId: string,
        pool: AssetPoolDocument,
        erc721: ERC721Document,
        metadata: ERC721MetadataDocument,
        claims: ClaimDocument[];
    const claimAmount = 10;
    const config = {
        title: '',
        description: '',
        price: 0,
        priceCurrency: 'USD',
        pointPrice: 0,
        limit: 0,
    } as TERC721Perk;

    beforeAll(async () => {
        await beforeAllCallback();
        const chainId = ChainId.Hardhat;
        pool = await PoolService.deploy(sub, chainId, 'My Reward Campaign', new Date());
        poolId = String(pool._id);
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
    });
    afterAll(afterAllCallback);

    describe('PointPrice = 100', () => {
        it('POST /erc721-perks', (done) => {
            user.post('/v1/erc721-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    ...config,
                    erc721Id: erc721._id,
                    metadataIds: JSON.stringify([metadata._id]),
                    pointPrice: 100,
                    claimAmount,
                })
                .expect((res: request.Response) => {
                    expect(res.body[0].claims).toHaveLength(claimAmount);
                    claims = res.body[0].claims;
                })
                .expect(201, done);
        });

        it('should return a 200 for first claim attempt by wallet 0', (done) => {
            user.get(`/v1/claims/${claims[0].uuid}`)
                .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
                .expect(200, done);
        });

        it('should return a 403 for claim', (done) => {
            user.post(`/v1/claims/${claims[0].uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.error.message).toBe('This perk should be redeemed with points.');
                })
                .expect(403, done);
        });
    });

    describe('PointPrice = 0', () => {
        it('POST /erc721-perks', (done) => {
            user.post('/v1/erc721-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    ...config,
                    erc721Id: erc721._id,
                    metadataIds: JSON.stringify([metadata._id]),
                    claimAmount,
                })
                .expect((res: request.Response) => {
                    expect(res.body[0].claims).toHaveLength(claimAmount);
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
                .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
                .expect(({ body }: request.Response) => {
                    expect(body.error.message).toBe('This NFT is claimed already.');
                })
                .expect(403, done);
        });

        it('First attempt other account should also fail', (done) => {
            user.post(`/v1/claims/${claims[0].uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken2 })
                .expect(({ body }: request.Response) => {
                    expect(body.error.message).toBe('This NFT is claimed already.');
                })
                .expect(403, done);
        });

        it('First attempt other claim for other account should succeed', (done) => {
            user.post(`/v1/claims/${claims[1].uuid}/collect`)
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
