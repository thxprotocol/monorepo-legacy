import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/types/enums';
import { dashboardAccessToken } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { addMinutes } from '@thxnetwork/api/util/rewards';
import { createImage } from '@thxnetwork/api/util/jest/images';
import { ERC721PerkDocument } from '@thxnetwork/api/models/ERC721Perk';
import { ERC721Document } from '@thxnetwork/api/models/ERC721';
import { ERC721MetadataDocument } from '@thxnetwork/api/models/ERC721Metadata';

const user = request.agent(app);

describe('NFT Rewards', () => {
    let poolId: string, erc721metadata: ERC721MetadataDocument, erc721: ERC721Document, perk: ERC721PerkDocument;
    const name = 'Planets of the Galaxy',
        symbol = 'GLXY',
        description = 'description';

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    it('POST /erc721', (done) => {
        user.post('/v1/erc721')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
                name,
                symbol,
                description,
            })
            .expect(({ body }: request.Response) => {
                expect(body._id).toBeDefined();
                expect(body.address).toBeDefined();
                erc721 = body;
            })
            .expect(201, done);
    });

    it('POST /erc721/:id/metadata', (done) => {
        const config = {
            name: 'Lorem',
            description: 'Lorem ipsum dolor sit.',
            imageUrl: 'https://image.com',
            externalUrl: 'https://example.com',
        };

        user.post('/v1/erc721/' + erc721._id + '/metadata')
            .set('Authorization', dashboardAccessToken)
            .send(config)
            .expect(({ body }: request.Response) => {
                expect(body._id).toBeDefined();
                expect(body.name).toBe(config.name);
                expect(body.description).toBe(config.description);
                expect(body.image).toBe(config.imageUrl);
                expect(body.externalUrl).toBe(config.externalUrl);
                erc721metadata = body;
            })
            .expect(201, done);
    });

    it('POST /pools', (done) => {
        user.post('/v1/pools')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
            })
            .expect(({ body }: request.Response) => {
                expect(isAddress(body.safeAddress)).toBe(true);
                poolId = body._id;
            })
            .expect(201, done);
    });

    it('POST /erc721-perks', (done) => {
        const expiryDate = addMinutes(new Date(), 30);
        const image = createImage();
        const config = {
            title: 'Lorem',
            description: 'Lorem ipsum',
            erc721Id: String(erc721._id),
            metadataIds: JSON.stringify([erc721metadata._id]),
            price: 0,
            priceCurrency: 'USD',
            pointPrice: 200,
            expiryDate: new Date(expiryDate).toISOString(),
            limit: 0,
            claimAmount: 0,
            isPromoted: true,
        };
        user.post('/v1/erc721-perks')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .attach('file', image, {
                filename: 'test.jpg',
                contentType: 'image/jpg',
            })
            .field(config)
            .expect((res: request.Response) => {
                expect(res.body[0].uuid).toBeDefined();
                expect(res.body[0].title).toBe(config.title);
                expect(res.body[0].description).toBe(config.description);
                expect(res.body[0].image).toBeDefined();
                expect(res.body[0].pointPrice).toBe(config.pointPrice);
                expect(new Date(res.body[0].expiryDate).getDate()).toBe(expiryDate.getDate());
                expect(res.body[0].limit).toBe(config.limit);
                expect(res.body[0].claimAmount).toBe(config.claimAmount);
                expect(res.body[0].claims.length).toBe(0);
                expect(res.body[0].isPromoted).toBe(config.isPromoted);
                expect(res.body[0].nft).toBeDefined();
                expect(res.body[0].erc721Id).toBe(erc721._id);
                expect(res.body[0].metadataId).toBe(erc721metadata._id);
            })
            .expect(201, done);
    });

    it('GET /erc721-perks', (done) => {
        user.get('/v1/erc721-perks')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect((res: request.Response) => {
                expect(res.body.results.length).toBe(1);
                expect(res.body.results[0].claims).toHaveLength(0);
                expect(res.body.limit).toBe(10);
                expect(res.body.total).toBe(1);
                perk = res.body.results[0];
            })
            .expect(200, done);
    });

    it('GET /erc20-perks/:id', (done) => {
        user.get('/v1/erc721-perks/' + perk._id)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect((res: request.Response) => {
                expect(res.body.claims).toHaveLength(perk.claims.length);
                expect(res.body.payments).toHaveLength(0);
            })
            .expect(200, done);
    });

    it('DELETE /erc20-perks/:id', (done) => {
        user.delete('/v1/erc721-perks/' + perk._id)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(204, done);
    });
});
