import db from '../src/app/util/database';
import { ContractName, currentVersion, DiamondVariant } from '../../../libs/contracts/exports';
import { getContract } from '../src/app/config/contracts';
import { MONGODB_URI } from '../src/app/config/secrets';
import { AssetPool, AssetPoolDocument } from '../src/app/models/AssetPool';
import { ChainId } from '@thxnetwork/types/enums';
import { updateDiamondContract } from '../src/app/util/upgrades';
import PoolService from '../src/app/services/PoolService';
import AnalyticsService from '@thxnetwork/api/services/AnalyticsService';

db.connect(MONGODB_URI);

async function main() {
    let counter = 0;

    for (const pool of await AssetPool.find({ 'settings.isPublished': true })) {
        await AnalyticsService.createLeaderboard(pool);
    }

    const pools: AssetPoolDocument[] = await AssetPool.find({
        version: { $ne: currentVersion },
        chainId: ChainId.Polygon,
    });
    const startTime = Date.now();
    const diamonds: Partial<Record<ContractName, DiamondVariant>> = {
        Registry: 'registry',
        Factory: 'factory',
    };

    for (const [contractName, diamondVariant] of Object.entries(diamonds)) {
        for (const chainId of [ChainId.Polygon]) {
            try {
                const contract = getContract(chainId, contractName as ContractName);
                const tx = await updateDiamondContract(chainId, contract, diamondVariant);
                if (tx) console.log(`Upgraded: ${contractName} (${ChainId[chainId]}):`, currentVersion);
            } catch (error) {
                console.error(error);
            }
        }
    }

    for (const pool of pools) {
        try {
            console.log(`${counter++}/${pools.length}`);
            const isUpgraded = await PoolService.updateAssetPool(pool, currentVersion);
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
