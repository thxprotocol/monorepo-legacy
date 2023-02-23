import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/api/types/enums';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { dashboardAccessToken } from '@thxnetwork/api/util/jest/constants';
import { createArchiver } from '@thxnetwork/api/util/zip';
import { createImage } from '@thxnetwork/api/util/jest/images';

const user = request.agent(app);

describe('NFT Pool', () => {
    let poolId: string, erc721ID: string, metadataId: string;

    const chainId = ChainId.Hardhat,
        name = 'Planets of the Galaxy',
        symbol = 'GLXY',
        description = 'Collection full of rarities.',
        schema = [
            { name: 'name', propType: 'string', description: 'lorem ipsum' },
            { name: 'description', propType: 'string', description: 'lorem ipsum dolor sit' },
            { name: 'image', propType: 'image', description: 'image description' },
            { name: 'externalUrl', propType: 'url', description: 'image description' },
        ];

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    describe('POST /erc721', () => {
        it('should create and return contract details', (done) => {
            user.post('/v1/erc721')
                .set('Authorization', dashboardAccessToken)
                .send({
                    chainId,
                    name,
                    symbol,
                    description,
                    schema,
                })
                .expect(({ body }: request.Response) => {
                    expect(body._id).toBeDefined();
                    expect(body.address).toBeDefined();
                    erc721ID = body._id;
                })
                .expect(201, done);
        });
    });

    describe('POST /pools', () => {
        it('HTTP 201 (success)', (done) => {
            user.post('/v1/pools')
                .set('Authorization', dashboardAccessToken)
                .send({
                    chainId: ChainId.Hardhat,
                    title: 'My Pool',
                })
                .expect(({ body }: request.Response) => {
                    expect(body.title).toBe('My Pool');
                    expect(isAddress(body.address)).toBe(true);
                    poolId = body._id;
                })
                .expect(201, done);
        });
    });

    describe('POST /erc721/:id/metadata', () => {
        const value1 = 'red',
            value2 = 'large',
            value3 = 'http://imageURL',
            value4 = 'http://externalurl.com';

        it('HTTP 201', (done) => {
            user.post('/v1/erc721/' + erc721ID + '/metadata')
                .set('Authorization', dashboardAccessToken)
                .set('X-PoolId', poolId)
                .send({
                    attributes: [
                        { key: schema[0].name, value: value1 },
                        { key: schema[1].name, value: value2 },
                        { key: schema[2].name, value: value3 },
                        { key: schema[3].name, value: value4 },
                    ],
                })
                .expect(({ body }: request.Response) => {
                    expect(body._id).toBeDefined();
                    expect(body.name).toBe(value1);
                    expect(body.description).toBe(value2);
                    expect(body.image).toBe(value3);
                    expect(body.externalUrl).toBe(value4);

                    metadataId = body._id;
                })
                .expect(201, done);
        });
    });

    describe('PATCH /metadata/:metadataId', () => {
        const value1 = 'blue',
            value2 = 'small',
            value3 = 'http://imageURL2',
            value4 = 'http://externalurl2.com';

        it('should return modified metadata for metadataId', (done) => {
            user.patch('/v1/erc721/' + erc721ID + '/metadata/' + metadataId)
                .set('X-PoolId', poolId)
                .set('Authorization', dashboardAccessToken)
                .send({
                    attributes: [
                        { key: schema[0].name, value: value1 },
                        { key: schema[1].name, value: value2 },
                        { key: schema[2].name, value: value3 },
                        { key: schema[3].name, value: value4 },
                    ],
                })
                .expect(({ body }: request.Response) => {
                    expect(body.name).toBe(value1);
                    expect(body.description).toBe(value2);
                    expect(body.image).toBe(value3);
                    expect(body.externalUrl).toBe(value4);
                })
                .expect(200, done);
        });
    });

    describe('POST /erc721/:id/metadata/zip', () => {
        it('HTTP 201', async () => {
            const image1 = createImage();
            const image2 = createImage();
            const image3 = createImage();
            const zip = createArchiver().jsZip;
            const zipFolder = zip.folder('testImages');
            zipFolder.file('image1.jpg', image1, { binary: true });
            zipFolder.file('image2.jpg', image2, { binary: true });
            zipFolder.file('image3.jpg', image3, { binary: true });

            const zipFile = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
            await user
                .post('/v1/erc721/' + erc721ID + '/metadata/zip')
                .set('Authorization', dashboardAccessToken)
                .set('X-PoolId', poolId)
                .attach('file', zipFile, { filename: 'images.zip', contentType: 'application/zip' })
                .field({
                    description,
                    propName: 'image',
                })
                .expect(201);
        });
    });

    describe('GET /metadata', () => {
        it('HTTP 200', (done) => {
            user.get('/v1/erc721/' + erc721ID + '/metadata')
                .set('Authorization', dashboardAccessToken)
                .expect(({ body }: request.Response) => {
                    expect(body.results.length).toBe(4);
                    expect(body.total).toBe(4);
                })
                .expect(200, done);
        });
    });
});
