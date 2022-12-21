import { getContractFromName } from '@thxnetwork/api/config/contracts';
import ERC20 from '@thxnetwork/api/models/ERC20';
import { ERC20Token, ERC20TokenDocument } from '@thxnetwork/api/models/ERC20Token';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { ChainId } from '@thxnetwork/api/types/enums';
import { MONGODB_URI } from '../src/app/config/secrets';
import db from '../src/app/util/database';
import * as csvWriter from 'csv-writer';
import fs from 'fs';

db.connect(MONGODB_URI);

async function main() {
    if (process.argv.length == 0) {
        throw new Error('Missing chainid argument');
    }
    const chainId = Number(process.argv[process.argv.length - 1]);
    if (!Object.values(ChainId).includes(chainId)) {
        throw new Error('Invalid or missing chainid argument');
    }
    console.log(`SCRIPT STERTED WITH CHAIN ID: ${chainId} --------------------------------------------`);
    const erc20Tokens: ERC20TokenDocument[] = await ERC20Token.aggregate([
        { $group: { _id: '$erc20Id', erc20Id: { $first: '$erc20Id' }, sub: { $first: '$sub' } } },
    ]);

    const header = [
        { id: 'token_symbol', title: 'TOKEN SYMBOL' },
        { id: 'token_address', title: 'TOKEN ADDRESS' },
        { id: 'sub', title: 'ACCOUNT ID' },
        { id: 'account_address', title: 'ACCOUNT ADDRESS' },
        { id: 'balance', title: 'BALANCE' },
    ];
    const rows: any = [];
    let zeroBalances = 0;

    for (let i = 0; i < erc20Tokens.length; i++) {
        const erc20Token = erc20Tokens[i];
        const account = await AccountProxy.getById(erc20Token.sub);
        if (account.address) {
            const erc20 = await ERC20.findById(erc20Token.erc20Id);
            const token = getContractFromName(chainId, 'LimitedSupplyToken', erc20.address);
            try {
                const balance = await token.methods.balanceOf(account.address).call();
                if (balance > 0) {
                    const row = {
                        token_symbol: erc20.symbol,
                        token_address: erc20.address,
                        sub: erc20Token.sub,
                        account_address: account.address,
                        balance,
                    };
                    rows.push(row);
                } else {
                    zeroBalances++;
                }
            } catch (err) {
                console.log('ERROR in getBalance:', err.message);
            }
        }
    }

    // CREATE THE CSV CONTENT
    const csvStringifier = csvWriter.createObjectCsvStringifier({
        header,
    });
    const csvContent = `${csvStringifier.getHeaderString()}${csvStringifier.stringifyRecords(rows)}`;

    // PREPARE PARAMS FOR UPLOAD TO S3 BUCKET
    const csvFileName = `ercTokenBalances_chainId_${chainId}.csv`;

    await fs.promises.writeFile(csvFileName, csvContent);

    const result = {
        totErc20Tokens: erc20Tokens.length,
        totZeroBalances: zeroBalances,
    };
    console.log('SCRIPT COMPLETED --------------------------------------------');
    console.log('RESULT:', result);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
