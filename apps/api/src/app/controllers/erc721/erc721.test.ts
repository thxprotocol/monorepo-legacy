import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/common/enums';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { dashboardAccessToken } from '@thxnetwork/api/util/jest/constants';
import { createImage } from '@thxnetwork/api/util/jest/images';

const user = request.agent(app);

describe('ERC721', () => {
    const chainId = ChainId.Hardhat,
        name = 'Planets of the Galaxy',
        symbol = 'GLXY',
        description = 'Collection full of rarities.';
    let erc721ID: string;

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    describe('POST /erc721', () => {
        it('should create and return contract details', async () => {
            const logoImg = createImage();
            await user
                .post('/v1/erc721')
                .set('Authorization', dashboardAccessToken)
                .attach('file', logoImg, { filename: 'logoImg.jpg', contentType: 'image/jpg' })
                .field({
                    chainId,
                    name,
                    symbol,
                    description,
                })
                .expect(({ body }: request.Response) => {
                    expect(body._id).toBeDefined();
                    expect(body.chainId).toBe(chainId);
                    expect(body.name).toBe(name);
                    expect(body.symbol).toBe(symbol);
                    expect(body.description).toBe(description);
                    expect(isAddress(body.address)).toBe(true);
                    expect(body.logoImgUrl).toBeDefined();
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
                    .send()
                    .expect(({ body }: request.Response) => {
                        expect(body).toBeDefined();
                    })
                    .expect(200, done);
            });
        });
    });
});
