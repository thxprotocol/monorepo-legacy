import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/types/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import {
    authAccessToken,
    sub,
    sub2,
    userWalletAddress,
    userWalletAddress2,
    widgetAccessToken,
} from '@thxnetwork/api/util/jest/constants';
import { ERC721Document } from '@thxnetwork/api/models/ERC721';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { ERC721TokenDocument } from '@thxnetwork/api/models/ERC721Token';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import WalletService from '@thxnetwork/api/services/WalletService';
import TransactionService from '@thxnetwork/api/services/TransactionService';

const user = request.agent(app);

describe('ERC721Transfer', () => {
    let erc721: ERC721Document, erc721Token: ERC721TokenDocument, wallet: WalletDocument, wallet2: WalletDocument;

    const chainId = ChainId.Hardhat,
        name = 'Test Collection',
        symbol = 'TST',
        baseURL = 'https://example.com',
        logoImgUrl = 'https://img.url',
        metadataName = '',
        metadataImageUrl = '',
        metadataIPFSImageUrl = '',
        metadataDescription = '',
        metadataExternalUrl = '',
        to = '0x51193777AfF37caA0E1d5C26aBCaE3f29af5510D';

    beforeAll(async () => beforeAllCallback({ skipWalletCreation: true }));
    afterAll(afterAllCallback);

    describe('POST /wallet', () => {
        it('HTTP 201 for wallet1', (done) => {
            user.post(`/v1/wallets`)
                .set({ Authorization: authAccessToken })
                .send({
                    sub,
                    chainId: ChainId.Hardhat,
                    forceSync: true,
                })
                .expect(async ({ body }: request.Response) => {
                    expect(body._id).toBeDefined();
                    expect(body.address).toBeDefined();
                    wallet = body;
                })
                .expect(201, done);
        });
    });

    describe('POST /erc721/transfer', () => {
        beforeAll(async () => {
            const pool = await PoolService.deploy(sub, chainId, 'My Loyalty Pool');
            erc721 = await ERC721Service.deploy(
                {
                    sub,
                    chainId,
                    name,
                    symbol,
                    description: '',
                    baseURL,
                    properties: [],
                    archived: false,
                    logoImgUrl,
                },
                true,
            );
            const metadata = await ERC721Metadata.create({
                erc721Id: String(erc721._id),
                name: metadataName,
                image: metadataIPFSImageUrl,
                imageUrl: metadataImageUrl,
                description: metadataDescription,
                externalUrl: metadataExternalUrl,
            });

            await ERC721Service.addMinter(erc721, pool.address);

            erc721Token = await ERC721Service.mint(pool, erc721, metadata, wallet);
        });
        it('HTTP 201', (done) => {
            user.post('/v1/erc721/transfer')
                .set({ Authorization: widgetAccessToken })
                .send({
                    erc721Id: erc721._id,
                    erc721TokenId: erc721Token._id,
                    to,
                    forceSync: true,
                })
                .expect(async ({ body }: request.Response) => {
                    expect(body.sub).toBe('');
                    expect(body.recipient).toBe(to);
                    expect(await erc721.contract.methods.ownerOf(erc721Token.tokenId).call()).toBe(to);
                })
                .expect(201, done);
        });
    });
});
