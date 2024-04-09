import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, NFTVariant } from '@thxnetwork/common/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { sub, sub2, userWalletPrivateKey, widgetAccessToken } from '@thxnetwork/api/util/jest/constants';
import { poll } from '@thxnetwork/api/util/polling';
import { signTxHash } from '@thxnetwork/api/util/jest/network';
import { safeVersion } from '@thxnetwork/api/services/ContractService';
import { getProvider } from '@thxnetwork/api/util/network';
import {
    ERC721Token,
    ERC721TokenDocument,
    ERC721,
    ERC721Document,
    ERC721Metadata,
    Wallet,
    WalletDocument,
    Pool,
    PoolDocument,
} from '@thxnetwork/api/models';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import SafeService from '@thxnetwork/api/services/SafeService';

const user = request.agent(app);

describe('ERC721 Transfer', () => {
    let erc721: ERC721Document,
        erc721Token: ERC721TokenDocument,
        pool: PoolDocument,
        wallet: WalletDocument,
        safeTxHash = '';
    const chainId = ChainId.Hardhat,
        name = 'Test Collection',
        symbol = 'TST',
        baseURL = 'https://example.com',
        logoImgUrl = 'https://img.url',
        metadataName = 'Testname',
        metadataImageUrl = 'Testimageurl',
        metadataIPFSImageUrl = 'TestIPFSimageurl',
        metadataDescription = 'Testdescription',
        metadataExternalUrl = 'TestexternalURL';

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    it('Deploy Campaign Safe', async () => {
        const { web3 } = getProvider(chainId);
        pool = await PoolService.deploy(sub, 'My Reward Campaign');
        const safe = await SafeService.create({ chainId, sub, safeVersion, poolId: String(pool._id) });

        // Wait for safe address to return code
        await poll(
            () => web3.eth.getCode(safe.address),
            (data: string) => data === '0x',
            1000,
        );
        const code = await web3.eth.getCode(safe.address);
        const result = code !== '0x';

        expect(result).toBe(true);
    });

    it('Deploy ERC721', async () => {
        const { web3 } = getProvider(chainId);

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

        // Wait for nft address to return code
        await poll(
            async () => (await ERC721.findById(erc721._id)).address,
            (address: string) => !address || !address.length,
            1000,
        );

        erc721 = await ERC721.findById(erc721._id);

        const code = await web3.eth.getCode(erc721.address);
        const result = code !== '0x';
        expect(result).toBe(true);
    });

    it('Add ERC721 minter', async () => {
        pool = await Pool.findById(pool._id);

        const safe = await SafeService.findOneByPool(pool);
        erc721 = await ERC721.findById(erc721._id);

        await ERC721Service.addMinter(erc721, safe.address);

        // Wait for nft address to return code
        await poll(
            async () => await ERC721Service.isMinter(erc721, safe.address),
            (isMinter: boolean) => !isMinter,
            1000,
        );

        const isMinter = await ERC721Service.isMinter(erc721, safe.address);
        expect(isMinter).toBe(true);
    });

    it('Create ERC721 Metadata', async () => {
        // Create metadata for token
        const metadata = await ERC721Metadata.create({
            erc721Id: String(erc721._id),
            name: metadataName,
            image: metadataIPFSImageUrl,
            imageUrl: metadataImageUrl,
            description: metadataDescription,
            externalUrl: metadataExternalUrl,
        });
        const safe = await SafeService.findOneByPool(pool);

        // Wait for safe address to return code
        const { web3 } = getProvider(chainId);
        await poll(
            () => web3.eth.getCode(safe.address),
            (data: string) => data === '0x',
            1000,
        );

        wallet = await SafeService.findOne({ sub, safeVersion: { $exists: true } });

        // Mint a token for metadata
        erc721Token = await ERC721Service.mint(safe, erc721, wallet, metadata);

        // Wait for tokenId to be set in mint callback
        await poll(
            async () => (await ERC721Token.findById(erc721Token._id)).tokenId,
            (tokenId?: number) => typeof tokenId === 'undefined',
            1000,
        );

        erc721Token = await ERC721Token.findById(erc721Token._id);

        expect(erc721Token.tokenId).toBeDefined();
    });

    it('Transfer ERC721 ownership', async () => {
        const receiver = await Wallet.findOne({ sub: sub2, safeVersion });
        const { status, body } = await user
            .post('/v1/erc721/transfer')
            .set({ Authorization: widgetAccessToken })
            .send({
                walletId: String(wallet._id),
                erc721Id: erc721._id,
                erc721TokenId: erc721Token._id,
                to: receiver.address,
            });

        expect(status).toBe(201);
        expect(body.safeTxHash).toBeDefined();

        safeTxHash = body.safeTxHash;
    });

    it('Confirm tx', async () => {
        const wallet = await SafeService.findOne({ sub, safeVersion: { $exists: true } });
        const { signature } = await signTxHash(wallet.address, safeTxHash, userWalletPrivateKey);
        const { status, body } = await user
            .post(`/v1/account/wallets/confirm`)
            .set({ Authorization: widgetAccessToken })
            .query({ walletId: String(wallet._id) })
            .send({ chainId: ChainId.Hardhat, safeTxHash, signature });
        expect(status).toBe(200);
    });

    it('Wait for ownerOf', async () => {
        const receiver = await Wallet.findOne({ sub: sub2, safeVersion });
        const token = await ERC721Token.findById(erc721Token._id);
        const { contract } = await ERC721.findById(erc721._id);

        await poll(contract.methods.ownerOf(token.tokenId).call, (result: string) => result !== receiver.address, 1000);

        const owner = await contract.methods.ownerOf(token.tokenId).call();
        expect(owner).toEqual(receiver.address);
    });
});
