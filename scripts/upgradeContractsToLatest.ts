import db from '@/util/database';
import AssetPoolService from '@/services/AssetPoolService';
import AccountProxy from '@/proxies/AccountProxy';
import { MONGODB_URI } from '@/config/secrets';
import { getContract } from '@/config/contracts';
import { updateDiamondContract } from '@/util/upgrades';
import { AssetPool } from '@/models/AssetPool';
import { AccountPlanType, ChainId } from '@/types/enums';
import { ContractName, currentVersion, DiamondVariant } from '@thxnetwork/artifacts';

db.connect(MONGODB_URI);

async function main() {
    let counter = 0;
    let pools = await AssetPool.find({ version: { $ne: currentVersion } });
    const startTime = Date.now();
    const diamonds: Partial<Record<ContractName, DiamondVariant>> = {
        Registry: 'registry',
        Factory: 'factory',
    };

    for (const [contractName, diamondVariant] of Object.entries(diamonds)) {
        for (const chainId of [ChainId.PolygonMumbai, ChainId.Polygon]) {
            try {
                const contract = getContract(chainId, contractName as ContractName);
                const tx = await updateDiamondContract(chainId, contract, diamondVariant);
                if (tx) console.log(`Upgraded: ${contractName} (${ChainId[chainId]}):`, currentVersion);
            } catch (error) {
                console.error(error);
            }
        }
    }

    pools = await Promise.all(
        pools.filter(async (pool) => {
            try {
                const account = await AccountProxy.getById(pool.sub);
                if (!account) return;

                const isPaidAccount = [AccountPlanType.Basic, AccountPlanType.Premium].includes(account.plan);
                const isFreeMumbai = account.plan === AccountPlanType.Free && pool.chainId === ChainId.PolygonMumbai;

                return !isPaidAccount && !isFreeMumbai;
            } catch (error) {
                return false;
            }
        }),
    );

    for (const pool of pools) {
        try {
            console.log(`${counter++}/${pools.length}`);
            const isUpgraded = await AssetPoolService.updateAssetPool(pool, currentVersion);
            if (isUpgraded) {
                console.log('Upgrade:', pool.address, `${pool.variant} ${pool.version} -> ${currentVersion}`);
            }
        } catch (error) {
            console.error(String(pool._id), error);
        }
    }

    const endTime = Date.now();
    console.log(`🔔 Duration: ${Math.floor((endTime - startTime) / 1000)} seconds`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
