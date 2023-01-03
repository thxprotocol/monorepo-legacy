import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/api/types/enums';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { dashboardAccessToken } from '@thxnetwork/api/util/jest/constants';

const user = request.agent(app);

describe('ERC721', () => {
    const chainId = ChainId.Hardhat,
        name = 'Planets of the Galaxy',
        symbol = 'GLXY',
        description = 'Collection full of rarities.',
        schema = [
            { name: 'color', propType: 'string', description: 'lorem ipsum' },
            { name: 'size', propType: 'string', description: 'lorem ipsum dolor sit' },
        ];
    let erc721ID: string;

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    describe('POST /erc721', () => {
        it('should create and return contract details', async () => {
            const logoImg = 'myImage';
            await user
                .post('/v1/erc721')
                .set('Authorization', dashboardAccessToken)
                .send({
                    chainId,
                    name,
                    symbol,
                    description,
                    schema: JSON.stringify(schema),
                    logoImgUrl: logoImg,
                })
                .expect(({ body }: request.Response) => {
                    expect(body._id).toBeDefined();
                    expect(body.chainId).toBe(chainId);
                    expect(body.name).toBe(name);
                    expect(body.symbol).toBe(symbol);
                    expect(body.description).toBe(description);
                    expect(body.properties[0].description).toBe(schema[0].description);
                    expect(body.properties[0].name).toBe(schema[0].name);
                    expect(body.properties[0].propType).toBe(schema[0].propType);
                    expect(body.properties[1].description).toBe(schema[1].description);
                    expect(body.properties[1].name).toBe(schema[1].name);
                    expect(body.properties[1].propType).toBe(schema[1].propType);
                    expect(isAddress(body.address)).toBe(true);
                    expect(body.archived).toBe(false);
                    expect(body.logoImgUrl).toBe(logoImg);
                    erc721ID = body._id;
                })
                .expect(201);
        });
    });

    describe('GET /erc721/:id', () => {
        it('should return contract details', (done) => {
            user.get('/v1/erc721/' + erc721ID)
                .set('Authorization', dashboardAccessToken)
                .send()
                .expect(({ body }: request.Response) => {
                    expect(body.chainId).toBe(chainId);
                    expect(body.name).toBe(name);
                    expect(body.symbol).toBe(symbol);
                    expect(body.description).toBe(description);
                    expect(body.properties[0].description).toBe(schema[0].description);
                    expect(body.properties[0].name).toBe(schema[0].name);
                    expect(body.properties[0].propType).toBe(schema[0].propType);
                    expect(body.properties[1].description).toBe(schema[1].description);
                    expect(body.properties[1].name).toBe(schema[1].name);
                    expect(body.properties[1].propType).toBe(schema[1].propType);
                    expect(isAddress(body.address)).toBe(true);
                    expect(body.logoImgUrl).toBeDefined();
                })
                .expect(200, done);
        });
        it('should 400 for invalid ID', (done) => {
            user.get('/v1/erc721/' + 'invalid_id')
                .set('Authorization', dashboardAccessToken)
                .send()
                .expect(({ body }: request.Response) => {
                    expect(body.errors[0].msg).toContain('Invalid value');
                })
                .expect(400, done);
        });
        it('should 404 if not known', (done) => {
            user.get('/v1/erc721/' + '62397f69760ac5f9ab4454df')
                .set('Authorization', dashboardAccessToken)
                .send()
                .expect(({ body }: request.Response) => {
                    expect(body.error.message).toContain('Not Found');
                })
                .expect(404, done);
        });
        describe('PATCH /erc721/:id', () => {
            it('should update a created token', (done) => {
                user.patch('/v1/erc721/' + erc721ID)
                    .set('Authorization', dashboardAccessToken)
                    .send({
                        archived: true,
                    })
                    .expect(({ body }: request.Response) => {
                        expect(body).toBeDefined();
                        expect(body.archived).toBe(true);
                    })
                    .expect(200, done);
            });
        });
    });
});
