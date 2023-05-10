import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, NFTVariant } from '@thxnetwork/types/enums';
import {
    sub,
    dashboardAccessToken,
    walletAccessToken,
    walletAccessToken2,
    account,
    account2,
} from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { ClaimDocument } from '@thxnetwork/api/types/TClaim';
import { subMinutes } from '@thxnetwork/api/util/rewards';
import { ERC721Document } from '@thxnetwork/api/models/ERC721';
import { ERC721Metadata, ERC721MetadataDocument } from '@thxnetwork/api/models/ERC721Metadata';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';

const user = request.agent(app);

describe('Claims', () => {
    let poolId: string, pool: AssetPoolDocument, erc721: ERC721Document, metadata: ERC721MetadataDocument;
    const chainId = ChainId.Hardhat,
        name = 'Test Collection',
        symbol = 'TST',
        baseURL = 'https://example.com',
        logoImgUrl = 'https://img.url',
        metadataName = '',
        metadataImageUrl = '',
        metadataIPFSImageUrl = '',
        metadataDescription = '',
        metadataExternalUrl = '',
        config = {
            title: '',
            description: '',
            amount: 1,
            price: 0,
            priceCurrency: 'USD',
            pointPrice: 0,
            limit: 0,
            claimLimit: 0,
            claimAmount: 1,
        };

    beforeAll(async () => {
        await beforeAllCallback();
        pool = await PoolService.deploy(sub, chainId, 'My Loyalty Pool');
        poolId = String(pool._id);
        erc721 = await ERC721Service.deploy(
            {
                variant: NFTVariant.ERC721,
                sub,
                chainId,
                name,
                symbol,
                description: '',
                baseURL,
                properties: [],
                archived: false,
                logoImgUrl,
            },
            true,
        );
        metadata = await ERC721Metadata.create({
            erc721Id: String(erc721._id),
            name: metadataName,
            image: metadataIPFSImageUrl,
            imageUrl: metadataImageUrl,
            description: metadataDescription,
            externalUrl: metadataExternalUrl,
        });
    });
    afterAll(afterAllCallback);

    describe('ExpiryDate = t-30min', () => {
        const expiryDate = subMinutes(new Date(), 30);
        let claim: ClaimDocument;

        it('POST /erc721-perks', (done) => {
            user.post('/v1/erc721-perks')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    ...config,
                    erc721Id: erc721._id,
                    erc721metadataIds: JSON.stringify([metadata._id]),
                    expiryDate: String(expiryDate),
                })
                .expect((res: request.Response) => {
                    expect(res.body[0].claims).toHaveLength(1);
                    claim = res.body[0].claims[0];
                })
                .expect(201, done);
        });
        it('should return a 403 when expired', (done) => {
            user.post(`/v1/claims/${claim.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.error.message).toBe('This perk claim has expired.');
                })
                .expect(403, done);
        });
    });

    describe('PointPrice = 100', () => {
        let claim: ClaimDocument;

        it('POST /erc721-perks', (done) => {
            user.post('/v1/erc721-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    ...config,
                    erc721Id: erc721._id,
                    erc721metadataIds: JSON.stringify([metadata._id]),
                    pointPrice: 100,
                })
                .expect((res: request.Response) => {
                    expect(res.body[0].claims).toHaveLength(1);
                    claim = res.body[0].claims[0];
                })
                .expect(201, done);
        });

        it('should return a 403 for claim', (done) => {
            user.post(`/v1/claims/${claim.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.error.message).toBe('This perk should be redeemed with points.');
                })
                .expect(403, done);
        });
    });

    describe('Limit = 0', () => {
        let claim: ClaimDocument;

        it('POST /erc721-perks', (done) => {
            user.post('/v1/erc721-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    ...config,
                    erc721Id: erc721._id,
                    erc721metadataIds: JSON.stringify([metadata._id]),
                    claimLimit: 0,
                })
                .expect((res: request.Response) => {
                    expect(res.body[0].claims).toHaveLength(1);
                    claim = res.body[0].claims[0];
                })
                .expect(201, done);
        });
        it('should return a 200 for first claim attempt by wallet 0', (done) => {
            user.post(`/v1/claims/${claim.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect(200, done);
        });
        it('should return a 200 for second claim attempt by wallet 1', (done) => {
            user.post(`/v1/claims/${claim.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                .expect(200, done);
        });
    });

    describe('ClaimLimit = 1 (other wallet claims)', () => {
        let claim: ClaimDocument;

        it('POST /erc721-perks', (done) => {
            user.post('/v1/erc721-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    ...config,
                    erc721Id: erc721._id,
                    erc721metadataIds: JSON.stringify([metadata._id]),
                    claimLimit: 1,
                    claimAmount: 2,
                })
                .expect((res: request.Response) => {
                    expect(res.body[0].claims).toHaveLength(2);
                    claim = res.body[0].claims[0];
                })
                .expect(201, done);
        });
        it('should return a 200 for first claim attempt by wallet 0', (done) => {
            user.post(`/v1/claims/${claim.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect(200, done);
        });
        it('should return a 403 for second claim attempt', (done) => {
            user.post(`/v1/claims/${claim.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                .expect((res: request.Response) => {
                    expect(res.body.error.message).toBe('This perk has been claimed already.');
                })
                .expect(403, done);
        });
    });

    describe('ClaimLimit = 1 (same wallet claims)', () => {
        let claim0: ClaimDocument, claim1: ClaimDocument;

        it('POST /erc20-perks', (done) => {
            user.post('/v1/erc721-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    ...config,
                    erc721Id: erc721._id,
                    erc721metadataIds: JSON.stringify([metadata._id]),
                    claimLimit: 1,
                    claimAmount: 2,
                })
                .expect((res: request.Response) => {
                    expect(res.body[0].claims).toHaveLength(2);
                    claim0 = res.body[0].claims[0];
                    claim1 = res.body[0].claims[1];
                    expect(res.body[0].claims[2]).toBeUndefined();
                })
                .expect(201, done);
        });
        it('should return a 200 for claim 0', (done) => {
            user.post(`/v1/claims/${claim0.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect(({ body }: request.Response) => {
                    expect(body.claim.sub).toBe(account2.sub);
                    expect(body.claim.claimedAt).toBeDefined();
                })
                .expect(200, done);
        });
        it('should return a 403 for second attempt on claim 0', (done) => {
            user.post(`/v1/claims/${claim0.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.error.message).toBe('You have claimed this perk for the maximum amount of times.');
                })
                .expect(403, done);
        });
        it('should return a 403 for claim 0', (done) => {
            user.post(`/v1/claims/${claim0.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                .expect((res: request.Response) => {
                    expect(res.body.error.message).toBe('This perk has been claimed already.');
                })
                .expect(403, done);
        });
        it('should return a 200 for claim 1', (done) => {
            user.post(`/v1/claims/${claim1.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                .expect(({ body }: request.Response) => {
                    expect(body.claim.sub).toBe(account.sub);
                    expect(body.claim.claimedAt).toBeDefined();
                })
                .expect(200, done);
        });
        it('should return a 403 for second attempt on claim 1', (done) => {
            user.post(`/v1/claims/${claim1.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                .expect((res: request.Response) => {
                    expect(res.body.error.message).toBe('You have claimed this perk for the maximum amount of times.');
                })
                .expect(403, done);
        });
    });
});
