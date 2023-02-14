import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/api/types/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { dashboardAccessToken, sub } from '@thxnetwork/api/util/jest/constants';
import { ERC721TokenState } from '@thxnetwork/api/types/TERC721';
import { ERC721Document } from '@thxnetwork/api/models/ERC721';
import { alchemy } from '@thxnetwork/api/util/alchemy';
import { deployNFT, mockGetNftsForOwner } from '@thxnetwork/api/util/jest/nft';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { Contract } from 'web3-eth-contract';
import { getProvider } from '@thxnetwork/api/util/network';
import TransactionService from '@thxnetwork/api/services/TransactionService';

const user = request.agent(app);

describe('ERC721 import', () => {
    let erc721: ERC721Document, pool: AssetPoolDocument, nftContract: Contract;
    const chainId = ChainId.Hardhat,
        nftName = 'Test Collection',
        nftSymbol = 'TST';

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    describe('POST /pools', () => {
        it('HTTP 201', (done) => {
            user.post('/v1/pools')
                .set('Authorization', dashboardAccessToken)
                .send({ chainId })
                .expect((res: request.Response) => {
                    pool = res.body;
                })
                .expect(201, done);
        });
    });

    describe('POST /erc721/import', () => {
        it('HTTP 201`', async () => {
            // Create 1 NFT collection
            nftContract = await deployNFT(nftName, nftSymbol);

            // Mint 1 token in the collection
            await TransactionService.sendAsync(
                nftContract.options.address,
                nftContract.methods.mint(pool.address, 'tokenuri.json'),
                chainId,
            );

            // Mock Alchemy SDK return value for getNftsForOwner
            jest.spyOn(alchemy.nft, 'getNftsForOwner').mockImplementation(() =>
                Promise.resolve(mockGetNftsForOwner(nftContract.options.address, nftName, nftSymbol) as any),
            );

            // Run the import for the deployed contract address
            await user
                .post('/v1/erc721/import')
                .set({ 'Authorization': dashboardAccessToken, 'X-PoolId': pool._id })
                .send({ chainId, contractAddress: nftContract.options.address })
                .expect(({ body }: request.Response) => {
                    expect(body.erc721._id).toBeDefined();
                    expect(body.erc721.address).toBe(nftContract.options.address);

                    erc721 = body.erc721;
                })
                .expect(201);
        });
    });

    describe('GET /erc721/:id', () => {
        const { defaultAccount } = getProvider(chainId);

        it('HTTP 200', (done) => {
            user.get(`/v1/erc721/${erc721._id}`)
                .set('Authorization', dashboardAccessToken)
                .send()
                .expect(({ body }: request.Response) => {
                    expect(body.chainId).toBe(chainId);
                    expect(body.sub).toBe(sub);
                    expect(body.name).toBe(nftName);
                    expect(body.symbol).toBe(nftSymbol);
                    expect(body.address).toBe(nftContract.options.address);
                    expect(body.properties[0].name).toBe('name');
                    expect(body.properties[0].propType).toBe('string');
                    expect(body.properties[1].name).toBe('description');
                    expect(body.properties[1].propType).toBe('string');
                    expect(body.properties[2].name).toBe('image');
                    expect(body.properties[2].propType).toBe('image');
                    expect(body.totalSupply).toBe('1');
                    expect(body.owner).toBe(defaultAccount);
                })
                .expect(200, done);
        });
    });

    describe('GET /erc721/token', () => {
        it('HTTP 200', (done) => {
            user.get(`/v1/erc721/token?chainId=${chainId}`)
                .set('Authorization', dashboardAccessToken)
                .send()
                .expect(({ body }: request.Response) => {
                    expect(body.length).toBe(1);
                    expect(body[0].sub).toBe(sub);
                    expect(body[0].erc721Id).toBe(erc721._id);
                    expect(body[0].state).toBe(ERC721TokenState.Minted);
                    expect(body[0].recipient).toBe(pool.address);
                    expect(body[0].tokenUri).toBeDefined();
                    expect(body[0].tokenId).toBeDefined();
                    expect(body[0].metadataId).toBeDefined();
                })
                .expect(200, done);
        });
    });

    describe('GET /erc721/:id/metadata', () => {
        it('HTTP 200', (done) => {
            user.get(`/v1/erc721/${erc721._id}/metadata`)
                .set('Authorization', dashboardAccessToken)
                .send()
                .expect(({ body }: request.Response) => {
                    expect(body.total).toBe(1);
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
