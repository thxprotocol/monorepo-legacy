import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, NFTVariant } from '@thxnetwork/types/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { sub, sub2, userWalletPrivateKey, widgetAccessToken } from '@thxnetwork/api/util/jest/constants';
import { ERC721, ERC721Document } from '@thxnetwork/api/models/ERC721';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { ERC721Token, ERC721TokenDocument } from '@thxnetwork/api/models/ERC721Token';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import { poll } from '@thxnetwork/api/util/polling';
import { signTxHash } from '@thxnetwork/api/util/jest/network';
import SafeService, { Wallet } from '@thxnetwork/api/services/SafeService';
import { safeVersion } from '@thxnetwork/api/config/contracts';
import { getProvider } from '@thxnetwork/api/util/network';

const user = request.agent(app);

describe('ERC721 Transfer', () => {
    let erc721: ERC721Document,
        erc721Token: ERC721TokenDocument,
        wallet: WalletDocument,
        to = '',
        safeTxHash = '';
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

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    it('Deploy ERC721', async () => {
        const { web3 } = getProvider(ChainId.Hardhat);
        const pool = await PoolService.deploy(sub, chainId, 'My Reward Campaign', new Date());
        const poolId = String(pool._id);
        const safe = await SafeService.create({ chainId, sub, safeVersion, poolId });

        wallet = await SafeService.findPrimary(sub, ChainId.Hardhat);
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

        // Add MINTER_ROLE to campaing safe
        await ERC721Service.addMinter(erc721, safe.address);

        // Create metadata for token
        const metadata = await ERC721Metadata.create({
            erc721Id: String(erc721._id),
            name: metadataName,
            image: metadataIPFSImageUrl,
            imageUrl: metadataImageUrl,
            description: metadataDescription,
            externalUrl: metadataExternalUrl,
        });

        // Wait for safe address to return code
        await poll(
            () => web3.eth.getCode(safe.address),
            (data: string) => data === '0x',
            1000,
        );

        // Mint a token for metadata
        erc721Token = await ERC721Service.mint(safe, erc721, wallet, metadata);

        // Wait for tokenId to be set in mint callback
        await poll(
            () => ERC721Token.findById(erc721Token._id),
            (token: ERC721TokenDocument) => !token.tokenId,
            1000,
        );
    });

    it('Transfer ERC721 ownership', async () => {
        const receiver = await Wallet.findOne({ sub: sub2, safeVersion });
        to = receiver.address;

        const { status, body } = await user.post('/v1/erc721/transfer').set({ Authorization: widgetAccessToken }).send({
            erc721Id: erc721._id,
            erc721TokenId: erc721Token._id,
            to,
        });

        expect(status).toBe(201);
        expect(body.safeTxHash).toBeDefined();

        safeTxHash = body.safeTxHash;
    });

    it('Confirm tx', async () => {
        const { signature } = await signTxHash(wallet.address, safeTxHash, userWalletPrivateKey);
        const res2 = await user
            .post(`/v1/account/wallet/confirm`)
            .set({ Authorization: widgetAccessToken })
            .send({ chainId: ChainId.Hardhat, safeTxHash, signature });

        expect(res2.status).toBe(200);
    });

    it('Wait for ownerOf', async () => {
        const token = await ERC721Token.findById(erc721Token._id);
        const { contract } = await ERC721.findById(erc721._id);

        await poll(contract.methods.ownerOf(token.tokenId).call, (result: string) => result !== to, 1000);

        const owner = await contract.methods.ownerOf(token.tokenId).call();
        expect(owner).toEqual(to);
    });
});
