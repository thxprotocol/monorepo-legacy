import type { IAccount } from '@thxnetwork/api/models/Account';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { AccountPlanType, ChainId } from '@thxnetwork/api/types/enums';

const checkAndUpgradeToBasicPlan = async (account: IAccount, chainId: ChainId) => {
    if (account.plan === AccountPlanType.Free && chainId === ChainId.Polygon) {
        await AccountProxy.update(account.id, { plan: AccountPlanType.Basic });
    }
};

export { checkAndUpgradeToBasicPlan };
