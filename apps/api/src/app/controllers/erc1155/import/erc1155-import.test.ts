import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/common/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { dashboardAccessToken, sub } from '@thxnetwork/api/util/jest/constants';
import { ERC1155TokenState } from '@thxnetwork/common/enums';
import { ERC1155Document } from '@thxnetwork/api/models/ERC1155';
import { alchemy } from '@thxnetwork/api/util/alchemy';
import { deployERC1155, mockGetNftsForOwner } from '@thxnetwork/api/util/jest/erc1155';
import { PoolDocument } from '@thxnetwork/api/models';
import { Contract } from 'web3-eth-contract';
import { getProvider } from '@thxnetwork/api/util/network';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { ethers } from 'ethers';

const user = request.agent(app);

describe('ERC1155 import', () => {
    let erc1155: ERC1155Document, pool: PoolDocument, nftContract: Contract;
    const chainId = ChainId.Hardhat,
        nftName = 'Test Collection';

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

    describe('POST /erc1155/import', () => {
        it('HTTP 201`', async () => {
            // Create 1 NFT collection
            nftContract = await deployERC1155();
            const id = 1;
            const amount = 1;
            // Mint 1 token in the collection
            await TransactionService.sendAsync(
                nftContract.options.address,
                nftContract.methods.mint(pool.safeAddress, id, amount, ethers.constants.HashZero),
                chainId,
            );

            // Mock Alchemy SDK return value for getNftsForOwner
            jest.spyOn(alchemy.nft, 'getNftsForOwner').mockImplementation(() =>
                Promise.resolve(mockGetNftsForOwner(nftContract.options.address) as any),
            );

            // Run the import for the deployed contract address
            await user
                .post('/v1/erc1155/import')
                .set({ 'Authorization': dashboardAccessToken, 'X-PoolId': pool._id })
                .send({ chainId, contractAddress: nftContract.options.address, name: nftName })
                .expect(({ body }: request.Response) => {
                    expect(body.erc1155._id).toBeDefined();
                    expect(body.erc1155.address).toBe(nftContract.options.address);

                    erc1155 = body.erc1155;
                })
                .expect(201);
        });
    });

    describe('GET /erc1155/:id', () => {
        const { defaultAccount } = getProvider(chainId);

        it('HTTP 200', (done) => {
            user.get(`/v1/erc1155/${erc1155._id}`)
                .set('Authorization', dashboardAccessToken)
                .send()
                .expect(({ body }: request.Response) => {
                    expect(body.chainId).toBe(chainId);
                    expect(body.sub).toBe(sub);
                    expect(body.name).toBe(nftName);
                    expect(body.address).toBe(nftContract.options.address);
                    expect(body.owner).toBe(defaultAccount);
                })
                .expect(200, done);
        });
    });

    describe('GET /erc1155/token', () => {
        it('HTTP 200', (done) => {
            user.get(`/v1/erc1155/token`)
                .query({ walletId: pool.safe._id })
                .set('Authorization', dashboardAccessToken)
                .send()
                .expect(({ body }: request.Response) => {
                    expect(body.length).toBe(1);
                    expect(body[0].sub).toBe(sub);
                    expect(body[0].erc1155Id).toBe(erc1155._id);
                    expect(body[0].state).toBe(ERC1155TokenState.Minted);
                    expect(body[0].recipient).toBe(pool.safeAddress);
                    expect(body[0].tokenUri).toBeDefined();
                    expect(body[0].tokenId).toBeDefined();
                    expect(body[0].metadataId).toBeDefined();
                })
                .expect(200, done);
        });
    });

    describe('GET /erc1155/:id/metadata', () => {
        it('HTTP 200', (done) => {
            user.get(`/v1/erc1155/${erc1155._id}/metadata`)
                .set('Authorization', dashboardAccessToken)
                .send()
                .expect(({ body }: request.Response) => {
                    expect(body.total).toBe(1);
                    expect(body.results[0].name).toBeDefined();
                    expect(body.results[0].description).toBeDefined();
                    expect(body.results[0].image).toBeDefined();
                })
                .expect(200, done);
        });
    });
});
