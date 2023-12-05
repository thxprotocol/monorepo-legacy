import db from '../src/app/util/database';
import { ContractName, currentVersion, DiamondVariant } from '../../../libs/contracts/exports';
import { getContract } from '../src/app/config/contracts';
import { MONGODB_URI } from '../src/app/config/secrets';
import { ChainId } from '@thxnetwork/types/enums';
import { updateDiamondContract } from '../src/app/util/upgrades';

db.connect(MONGODB_URI);

async function main() {
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

    const endTime = Date.now();
    console.log(`🔔 Duration: ${Math.floor((endTime - startTime) / 1000)} seconds`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
