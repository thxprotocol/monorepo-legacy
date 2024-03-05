import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/common/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { dashboardAccessToken } from '@thxnetwork/api/util/jest/constants';
import { createArchiver } from '@thxnetwork/api/util/zip';
import { createImage } from '@thxnetwork/api/util/jest/images';

const user = request.agent(app);

describe('ERC721 Metadata', () => {
    let erc721ID: string, metadataId: string;
    const chainId = ChainId.Hardhat,
        name = 'Planets of the Galaxy',
        symbol = 'GLXY',
        description = 'Collection full of rarities.';

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
                })
                .expect(({ body }: request.Response) => {
                    expect(body._id).toBeDefined();
                    expect(body.address).toBeDefined();
                    erc721ID = body._id;
                })
                .expect(201, done);
        });
    });

    describe('POST /erc721/:id/metadata', () => {
        const name = 'red',
            description = 'large',
            imageUrl = 'http://imageURL.com',
            externalUrl = 'http://externalurl.com';

        it('HTTP 201', (done) => {
            user.post('/v1/erc721/' + erc721ID + '/metadata')
                .set('Authorization', dashboardAccessToken)
                .send({
                    name,
                    description,
                    imageUrl,
                    externalUrl,
                })
                .expect(({ body }: request.Response) => {
                    expect(body._id).toBeDefined();
                    expect(body.name).toBe(name);
                    expect(body.description).toBe(description);
                    expect(body.image).toBe(imageUrl);
                    expect(body.imageUrl).toBe(imageUrl);
                    expect(body.externalUrl).toBe(externalUrl);
                    metadataId = body._id;
                })
                .expect(201, done);
        });
    });

    describe('PATCH /metadata/:metadataId', () => {
        const value1 = 'blue',
            value2 = 'small',
            value3 = 'http://imageURL2.com',
            value4 = 'http://externalurl2.com';

        it('should return modified metadata for metadataId', (done) => {
            user.patch('/v1/erc721/' + erc721ID + '/metadata/' + metadataId)
                .set('Authorization', dashboardAccessToken)
                .send({
                    name: value1,
                    description: value2,
                    imageUrl: value3,
                    externalUrl: value4,
                })
                .expect(({ body }: request.Response) => {
                    expect(body.name).toBe(value1);
                    expect(body.description).toBe(value2);
                    expect(body.image).toBe(value3);
                    expect(body.imageUrl).toBe(value3);
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
