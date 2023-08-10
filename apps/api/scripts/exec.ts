import { PointBalance } from '@thxnetwork/api/models/PointBalance';
import { Claim } from '@thxnetwork/api/models/Claim';
import { DailyRewardClaim } from '@thxnetwork/api/models/DailyRewardClaims';
import { ERC20PerkPayment } from '@thxnetwork/api/models/ERC20PerkPayment';
import { ERC20Token } from '@thxnetwork/api/models/ERC20Token';
import ERC20Transfer from '@thxnetwork/api/models/ERC20Transfer';
import { ERC721PerkPayment } from '@thxnetwork/api/models/ERC721PerkPayment';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';
import ERC721Transfer from '@thxnetwork/api/models/ERC721Transfer';
import { ERC1155Token } from '@thxnetwork/api/models/ERC1155Token';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import { PointRewardClaim } from '@thxnetwork/api/models/PointRewardClaim';
import { PoolSubscription } from '@thxnetwork/api/models/PoolSubscription';
import { ReferralRewardClaim } from '@thxnetwork/api/models/ReferralRewardClaim';
import { Withdrawal } from '@thxnetwork/api/models/Withdrawal';
import { Wallet } from '@thxnetwork/api/models/Wallet';

async function main() {
    try {
        const wallets = await Wallet.find({ sub: '' });
        const walletIds = wallets.map((wallet) => wallet._id);
        for (const model of [
            Claim,
            DailyRewardClaim,
            ERC20PerkPayment,
            ERC20Token,
            ERC20Transfer,
            ERC721PerkPayment,
            ERC721Token,
            ERC721Transfer,
            ERC1155Token,
            MilestoneRewardClaim,
            PointBalance,
            PointRewardClaim,
            PoolSubscription,
            ReferralRewardClaim,
            Withdrawal,
        ]) {
            console.log(walletIds, 'Done');
            await model.updateMany({ walletId: { $in: walletIds } }, { walletId: '' });
        }

        console.log('Data export and import completed.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sourceClient.close();
        await destClient.close();
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
