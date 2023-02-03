import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/api/types/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { dashboardAccessToken, sub, userWalletAddress, userWalletAddress3 } from '@thxnetwork/api/util/jest/constants';
import { ERC721TokenState } from '@thxnetwork/api/types/TERC721';
import nock from 'nock';
import { ALCHEMY_API_KEY } from '@thxnetwork/api/config/secrets';
import { getNetwork, nockResponse } from '@thxnetwork/api/util/alchemy';

const user = request.agent(app);

describe('ERC721 import', () => {
    let erc721ID: string, poolId: string;
    const chainId = ChainId.Hardhat;
    const contractAddress = '0x14ddb079C64f82501E98557D18defA12C5fC69Fa';
    const network = getNetwork(chainId);

    beforeAll(async () => {
        nock(`https://${network}.g.alchemy.com`)
            .get(`/nft/v2/${ALCHEMY_API_KEY}/getNFTs`)
            .query({
                'owner': userWalletAddress,
                'pageKey': '1',
                'contractAddresses[]': contractAddress,
                'withMetadata': 'true',
            })
            .reply(200, nockResponse);

        await beforeAllCallback();
    });

    afterAll(afterAllCallback);

    describe('POST /pools', () => {
        it('POST /pools', (done) => {
            user.post('/v1/pools')
                .set('Authorization', dashboardAccessToken)
                .send({
                    chainId: ChainId.Hardhat,
                })
                .expect((res: request.Response) => {
                    poolId = res.body._id;
                })
                .expect(201, done);
        });
    });
    describe('POST /erc721/import/:address', () => {
        it('POST /v1/erc721/import/:address`', async () => {
            await user
                .post(`/v1/erc721/import/${contractAddress}`)
                .set({ 'X-PoolId': poolId })
                .set('Authorization', dashboardAccessToken)
                .send({
                    chainId,
                })
                .expect((res: request.Response) => {
                    console.log('RESSS', res.body);
                    expect(res.body.erc721).toBeDefined();
                    expect(res.body.erc721._id).toBeDefined();
                    erc721ID = res.body.erc721._id;
                })
                .expect(201);
        });

        it('GET /erc721/:id', (done) => {
            user.get(`/v1/erc721/${erc721ID}`)
                .set('Authorization', dashboardAccessToken)
                .send()
                .expect(({ body }: request.Response) => {
                    expect(body.chainId).toBe(chainId);
                    expect(body.address.toLowerCase()).toBe(contractAddress.toLowerCase());
                    expect(body.sub).toBe(sub);
                    expect(body.name).toBe('TEST NFT COLLECTION');
                    expect(body.symbol).toBe('NFTCTEST');
                    expect(body.properties[0].name).toBe('name');
                    expect(body.properties[0].propType).toBe('string');
                    expect(body.properties[1].name).toBe('description');
                    expect(body.properties[1].propType).toBe('string');
                    expect(body.properties[2].name).toBe('image');
                    expect(body.properties[2].propType).toBe('image');
                    expect(body.totalSupply).toBe('4');
                    expect(body.owner).toBe(userWalletAddress3);
                })
                .expect(200, done);
        });

        it('GET /erc721/token', (done) => {
            user.get('/v1/erc721/token')
                .set('Authorization', dashboardAccessToken)
                .send()
                .expect(({ body }: request.Response) => {
                    expect(body.length).toBe(4);
                    expect(body[0].sub).toBe(sub);
                    expect(body[0].erc721Id).toBe(erc721ID);
                    expect(body[0].state).toBe(ERC721TokenState.Minted);
                    expect(body[0].recipient).toBe(userWalletAddress3);
                    expect(body[0].tokenUri).toBeDefined();
                    expect(body[0].tokenId).toBeDefined();
                    expect(body[0].metadataId).toBeDefined();
                })
                .expect(200, done);
        });

        it('GET /erc721/:id/metadata', (done) => {
            user.get(`/v1/erc721/${erc721ID}/metadata`)
                .set('Authorization', dashboardAccessToken)
                .send()
                .expect(({ body }: request.Response) => {
                    expect(body.total).toBe(4);
                    expect(body.results[0].attributes.length).toBe(3);
                    expect(body.results[0].attributes[0].key).toEqual('name');
                    expect(body.results[0].attributes[0].value).toBeDefined();
                    expect(body.results[0].attributes[1].key).toBe('description');
                    expect(body.results[0].attributes[1].value).toBeDefined();
                    expect(body.results[0].attributes[2].key).toBe('image');
                    expect(body.results[0].attributes[2].value).toBeDefined();
                })
                .expect(200, done);
        });
    });
});
