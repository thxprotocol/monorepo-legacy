import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/types/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { sub, userWalletAddress, userWalletAddress2, widgetAccessToken } from '@thxnetwork/api/util/jest/constants';
import { ERC721Document } from '@thxnetwork/api/models/ERC721';
import { ERC721TransferDocument } from '@thxnetwork/api/models/ERC721Transfer';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { ERC721TokenDocument } from '@thxnetwork/api/models/ERC721Token';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import WalletService from '@thxnetwork/api/services/WalletService';

const user = request.agent(app);

describe('ERC721Transfer', () => {
    let erc721: ERC721Document,
        erc721Token: ERC721TokenDocument,
        wallet: WalletDocument,
        erc721Transfer: ERC721TransferDocument;

    const chainId = ChainId.Hardhat,
        name = 'Test Collection',
        symbol = 'TST',
        baseURL = 'https://example.com',
        logoImgUrl = 'https://img.url',
        metadataName = '',
        metadataImageUrl = '',
        metadataIPFSImageUrl = '',
        metadataDescription = '',
        metadataExternalUrl = '';

    beforeAll(async () => {
        await beforeAllCallback();
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

        wallet = await WalletService.findOneByAddress(userWalletAddress);

        await ERC721Service.addMinter(erc721, pool.address);

        erc721Token = await ERC721Service.mint(pool, erc721, metadata, wallet);
    });

    afterAll(afterAllCallback);

    describe('POST /erc721/transfer', () => {
        it('HTTP 201', (done) => {
            user.post('/v1/erc721/transfer')
                .set({ Authorization: widgetAccessToken })
                .send({
                    erc721Id: erc721._id,
                    erc721TokenId: erc721Token._id,
                    to: userWalletAddress2,
                })
                .expect(async ({ body }: request.Response) => {
                    console.log(body);
                    erc721Transfer = body;
                })
                .expect(201, done);
        });
    });
});
