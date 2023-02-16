import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '../../types/enums';
import { dashboardAccessToken } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { addMinutes } from '@thxnetwork/api/util/rewards';
import { createImage } from '@thxnetwork/api/util/jest/images';
import { RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/index';
import { ERC721PerkDocument } from '@thxnetwork/api/models/ERC721Perk';
import { ERC721Document } from '@thxnetwork/api/models/ERC721';
import { ERC721MetadataDocument } from '@thxnetwork/api/models/ERC721Metadata';

const user = request.agent(app);

describe('ERC721 Perks', () => {
    let poolId: string, erc721metadata: ERC721MetadataDocument, erc721: ERC721Document, perk: ERC721PerkDocument;
    const name = 'Planets of the Galaxy',
        symbol = 'GLXY',
        description = 'description',
        schema = [
            {
                name: 'name',
                propType: 'string',
                description: 'The name of this item.',
                disabled: true,
            },
            {
                name: 'description',
                propType: 'string',
                description: 'A brief description of your item.',
                disabled: true,
            },

            {
                name: 'image',
                propType: 'image',
                description: 'A visual representation of the item.',
                disabled: true,
            },
            {
                name: 'external_url',
                propType: 'link',
                description: 'A link referencing to a page with more information on the item.',
                disabled: true,
            },
        ],
        metadataTitle = 'Lorem',
        metadataDescription = 'Lorem ipsum dolor sit.',
        externalUrl = 'https://example.com';

    beforeAll(async () => {
        await beforeAllCallback();
    });

    afterAll(afterAllCallback);

    it('POST /erc721', (done) => {
        user.post('/v1/erc721')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
                name,
                symbol,
                description,
                schema,
            })
            .expect(({ body }: request.Response) => {
                expect(body._id).toBeDefined();
                expect(body.address).toBeDefined();
                erc721 = body;
            })
            .expect(201, done);
    });

    it('POST /erc721?:id/metadata', (done) => {
        user.post('/v1/erc721/' + erc721._id + '/metadata')
            .set('Authorization', dashboardAccessToken)
            .send({
                attributes: [
                    { key: schema[0].name, value: metadataTitle },
                    { key: schema[1].name, value: metadataDescription },
                    { key: schema[3].name, value: externalUrl },
                ],
            })
            .expect(({ body }: request.Response) => {
                expect(body._id).toBeDefined();
                expect(body.attributes[0].key).toBe(schema[0].name);
                expect(body.attributes[1].key).toBe(schema[1].name);
                expect(body.attributes[2].key).toBe(schema[3].name);

                expect(body.attributes[0].value).toBe(metadataTitle);
                expect(body.attributes[1].value).toBe(metadataDescription);
                expect(body.attributes[2].value).toBe(externalUrl);

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
                expect(isAddress(body.address)).toBe(true);
                poolId = body._id;
            })
            .expect(201, done);
    });

    it('POST /erc721-perks', (done) => {
        const title = 'Lorem',
            description = 'Ipsum',
            expiryDate = addMinutes(new Date(), 30),
            pointPrice = 200,
            image = createImage(),
            platform = RewardConditionPlatform.Google,
            interaction = RewardConditionInteraction.YouTubeLike,
            content = 'videoid',
            rewardLimit = 0,
            claimAmount = 0,
            isPromoted = true;
        user.post('/v1/erc721-perks')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .attach('file', image, {
                filename: 'test.jpg',
                contentType: 'image/jpg',
            })
            .field({
                title,
                description,
                image,
                erc721Id: String(erc721._id),
                erc721metadataIds: JSON.stringify([erc721metadata._id]),
                price: 0,
                priceCurrency: 'USD',
                pointPrice,
                platform,
                interaction,
                content,
                expiryDate: expiryDate.toString(),
                rewardLimit,
                claimAmount,
                isPromoted,
            })
            .expect((res: request.Response) => {
                expect(res.body[0].uuid).toBeDefined();
                expect(res.body[0].title).toBe(title);
                expect(res.body[0].description).toBe(description);
                expect(res.body[0].image).toBeDefined();
                expect(res.body[0].pointPrice).toBe(pointPrice);
                expect(res.body[0].platform).toBe(platform);
                expect(res.body[0].interaction).toBe(interaction);
                expect(res.body[0].content).toBe(content);
                expect(new Date(res.body[0].expiryDate).getDate()).toBe(expiryDate.getDate());
                expect(res.body[0].rewardLimit).toBe(rewardLimit);
                expect(res.body[0].claimAmount).toBe(claimAmount);
                expect(res.body[0].claims.length).toBe(0);
                expect(res.body[0].isPromoted).toBe(isPromoted);
                expect(res.body[0].erc721).toBeDefined();
                expect(res.body[0].erc721Id).toBe(erc721._id);
                expect(res.body[0].erc721metadataId).toBe(erc721metadata._id);
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
