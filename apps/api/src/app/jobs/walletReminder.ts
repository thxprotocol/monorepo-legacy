import { getContractFromName } from '../config/contracts';
import { IAccount } from '../models/Account';
import ERC20 from '../models/ERC20';
import { ERC20Token } from '../models/ERC20Token';
import AccountProxy from '../proxies/AccountProxy';
import MailService from '../services/MailService';

export async function checkWaletFunds() {
    try {
        const erc20TokensBySub = await ERC20Token.aggregate([
            { $group: { _id: '$sub', erc20Id: { $first: '$erc20Id' }, sub: { $first: '$sub' } } },
        ]);
        const reminderList = new Map<string, string[]>();

        for (let i = 0; i < erc20TokensBySub.length; i++) {
            const erc20Token = erc20TokensBySub[i];
            const erc20 = await ERC20.findById(erc20Token.erc20Id, 'address chainId symbol');
            const account: IAccount = await AccountProxy.getById(erc20Token.sub);
            const contract = getContractFromName(erc20.chainId, 'LimitedSupplyToken', erc20.address);
            const balance = Number(await contract.methods.balanceOf(account.address).call());

            if (balance > 0) {
                if (reminderList.has(account.email)) {
                    reminderList.get(account.email).push(erc20.symbol);
                } else {
                    reminderList.set(account.email, [erc20.symbol]);
                }
            }
        }
        await Promise.all(
            Array.from(reminderList).map(async (x) => {
                const email = x[0];
                const tokens = x[1];
                const message =
                    tokens.length > 1
                        ? `You need to migrate these ERC20 Tokens: ${tokens.join(',')}`
                        : `You need to migrate the ERC20 Token: ${tokens[0]}`;
                await MailService.send(email, 'Tokens Migration Reminder', `${message}`);
            }),
        );
    } catch (err) {
        console.log('checkWaletFunds error:', err.message);
    }
}
