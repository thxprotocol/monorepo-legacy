import request from 'supertest';
import app from '@thxnetwork/api/';
import { Contract } from 'web3-eth-contract';
import { ChainId } from '@thxnetwork/common/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { dashboardAccessToken, sub } from '@thxnetwork/api/util/jest/constants';
import { alchemy } from '@thxnetwork/api/util/alchemy';
import { deployERC721, mockGetNftsForOwner } from '@thxnetwork/api/util/jest/erc721';
import { ERC721Document, PoolDocument } from '@thxnetwork/api/models';
import { getProvider } from '@thxnetwork/api/util/network';
import TransactionService from '@thxnetwork/api/services/TransactionService';

const user = request.agent(app);

describe('ERC721 import', () => {
    let erc721: ERC721Document, pool: PoolDocument, nftContract: Contract;
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
            nftContract = await deployERC721(nftName, nftSymbol);

            // Mint 1 token in the collection
            await TransactionService.sendAsync(
                nftContract.options.address,
                nftContract.methods.mint(pool.safeAddress, 'tokenuri.json'),
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
                    expect(body.totalSupply).toBe('1');
                    expect(body.owner).toBe(defaultAccount);
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
                    expect(body.results[0].name).toBeDefined();
                    expect(body.results[0].description).toBeDefined();
                    expect(body.results[0].image).toBeDefined();
                    expect(body.results[0].externalUrl).toBeDefined();
                })
                .expect(200, done);
        });
    });
});
