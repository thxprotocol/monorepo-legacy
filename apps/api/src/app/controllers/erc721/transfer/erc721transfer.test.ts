import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, NFTVariant } from '@thxnetwork/types/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { sub, sub2, userWalletPrivateKey, widgetAccessToken } from '@thxnetwork/api/util/jest/constants';
import { ERC721, ERC721Document } from '@thxnetwork/api/models/ERC721';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { ERC721TokenDocument } from '@thxnetwork/api/models/ERC721Token';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import { poll } from '@thxnetwork/api/util/polling';
import { signTxHash } from '@thxnetwork/api/util/jest/network';
import WalletService, { Wallet } from '@thxnetwork/api/services/WalletService';
import { safeVersion } from '@thxnetwork/api/config/contracts';

const user = request.agent(app);

describe('ERC721Transfer', () => {
    let erc721: ERC721Document, erc721Token: ERC721TokenDocument, wallet: WalletDocument;

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
    let to = '';

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    describe('POST /erc721/transfer', () => {
        beforeAll(async () => {
            const pool = await PoolService.deploy(sub, chainId, 'My Reward Campaign', true, true, new Date());
            erc721 = await ERC721Service.deploy(
                {
                    variant: NFTVariant.ERC721,
                    sub,
                    chainId,
                    name,
                    symbol,
                    description: '',
                    baseURL,
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

            wallet = await WalletService.findPrimary(sub, ChainId.Hardhat);

            await ERC721Service.addMinter(erc721, pool.address);

            erc721Token = await ERC721Service.mint(pool, erc721, metadata, wallet);
        });

        it('HTTP 201', async () => {
            const safe2 = await Wallet.findOne({ sub: sub2, safeVersion });
            to = safe2.address;
            const res = await user.post('/v1/erc721/transfer').set({ Authorization: widgetAccessToken }).send({
                erc721Id: erc721._id,
                erc721TokenId: erc721Token._id,
                to,
            });
            expect(res.body.safeTxHash).toBeDefined();
            expect(res.status).toBe(201);

            const { safeTxHash, signature } = await signTxHash(
                wallet.address,
                res.body.safeTxHash,
                userWalletPrivateKey,
            );
            const res2 = await user
                .post(`/v1/account/wallet/confirm`)
                .set({ Authorization: widgetAccessToken })
                .send({ chainId: ChainId.Hardhat, safeTxHash, signature });

            expect(res2.status).toBe(200);
        });
    });

    describe('Wait for ownerOf', () => {
        it('Poll', async () => {
            const { contract } = await ERC721.findById(erc721._id);
            await poll(contract.methods.ownerOf(erc721Token.tokenId).call, (result: string) => result !== to, 1000);
            const owner = await contract.methods.ownerOf(erc721Token.tokenId).call();
            expect(owner).toEqual(to);
        });
    });
});
