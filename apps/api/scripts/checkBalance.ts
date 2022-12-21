import { getContractFromName } from '@thxnetwork/api/config/contracts';
import ERC20 from '@thxnetwork/api/models/ERC20';
import { ERC20Token, ERC20TokenDocument } from '@thxnetwork/api/models/ERC20Token';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { ChainId } from '@thxnetwork/api/types/enums';
import { MONGODB_URI } from '../src/app/config/secrets';
import db from '../src/app/util/database';

db.connect(MONGODB_URI);

async function main() {
    if (process.argv.length == 0) {
        throw new Error('Missing chainid argument');
    }
    const chainId = Number(process.argv[process.argv.length - 1]);
    if (!Object.values(ChainId).includes(chainId)) {
        throw new Error('Invalid or missing chainid argument');
    }

    const erc20Tokens: ERC20TokenDocument[] = await ERC20Token.aggregate([
        { $group: { _id: '$erc20Id', erc20Id: { $first: '$erc20Id' }, sub: { $first: '$sub' } } },
    ]);

    console.log('CHAIN ID:', chainId);
    const promises = erc20Tokens.map(async (x) => {
        const account = await AccountProxy.getById(x.sub);
        if (account.address) {
            const erc20 = await ERC20.findById(x.erc20Id);
            const token = getContractFromName(ChainId.Hardhat, 'LimitedSupplyToken', erc20.address);
            try {
                const symbol = await token.methods.symbol().call();
                const balance = await token.methods.balanceOf(account.address).call();
                console.log(`BALANCE OF TOKEN "${symbol}" FOR ACCOUNT ${account.address} IS: ${balance.toString()}`);
            } catch (err) {
                console.log('ERROR in getBalance:', err.message);
            }
        }
    });
    await Promise.all(promises);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
