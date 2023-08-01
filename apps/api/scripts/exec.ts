import { ERC20Token } from '@thxnetwork/api/models/ERC20Token';
import db from '../src/app/util/database';
import ERC20 from '@thxnetwork/api/models/ERC20';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';
import { ERC721 } from '@thxnetwork/api/models/ERC721';
import { ERC1155 } from '@thxnetwork/api/models/ERC1155';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import fs from 'fs';
import path from 'path';

db.connect(process.env.MONGODB_URI_PROD);

async function getModels(objectList: any, propertyName, model: any) {
    const uniqueValuesSet = new Set(objectList.map((obj) => obj[propertyName]));
    return Object.fromEntries(
        await Promise.all(
            Array.from(uniqueValuesSet, async (id) => {
                return [id, await model.findById(id)];
            }),
        ),
    );
}

async function getBalances(tokenList, contractIdKey, contractList, walletList, getAmount) {
    const balances = {};
    for (const token of tokenList) {
        if (!token[contractIdKey] || !token.walletId) continue;
        const contract = contractList[token[contractIdKey]];
        if (!contract || !contract.chainId || contract.chainId != 137) continue;
        const wallet = walletList[token.walletId];
        if (!wallet) continue;

        balances[token.walletId] = {
            walletId: token.walletId,
            amount: await getAmount(wallet.address, contract),
            symbol: contract.symbol,
            address: contract.address,
        };
    }
    return balances;
}

async function main() {
    // Get all erc20tokens from database
    const erc20tokens = await ERC20Token.find({});
    const erc20List = await getModels(erc20tokens, 'erc20Id', ERC20);
    const erc20Wallets = await getModels(erc20tokens, 'walletId', Wallet);
    const erc20Balances = await getBalances(
        erc20List,
        'erc20Id',
        erc20List,
        erc20Wallets,
        async (address, contract) => await contract.contract.methods.balanceOf(address).call(),
    );

    const erc721tokens = await ERC721Token.find({});
    const erc721List = await getModels(erc721tokens, 'erc721Id', ERC721);
    const erc721Wallets = await getModels(erc721tokens, 'walletId', Wallet);
    const erc721Balances = await getBalances(
        erc721List,
        'erc721Id',
        erc721List,
        erc721Wallets,
        async (tokenId, contract) => await contract.contract.methods.ownerOf(tokenId).call(),
    );

    const erc1155tokens = await ERC721Token.find({});
    const erc1155List = await getModels(erc1155tokens, 'erc1155Id', ERC1155);
    const erc1155Wallets = await getModels(erc1155tokens, 'walletId', Wallet);

    fs.writeFileSync(path.join(__dirname, './erc20Balances.json'), JSON.stringify(erc20Balances, null, 2)); // 65
    // fs.writeFileSync(path.join(__dirname, './erc721Owners.json'), JSON.stringify(erc721Owners, null, 2)); // 531
    // fs.writeFileSync(path.join(__dirname, './erc1155Owners.json'), JSON.stringify(erc1155Owners, null, 2)); // 13

    console.log(
        'ERC20 holders #',
        Object.values(erc20Balances).filter((b: { amount: string }) => Number(b.amount) > 0).length,
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
