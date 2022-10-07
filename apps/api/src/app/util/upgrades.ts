import { getSelectors } from './network';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { Contract } from 'web3-eth-contract';
import { uniq } from '.';
import { ChainId } from '@thxnetwork/api/types/enums';
import { diamondContracts } from '@thxnetwork/api/config/contracts';
import { DiamondVariant } from '@thxnetwork/artifacts';
import { ADDRESS_ZERO } from '@thxnetwork/api/config/secrets';

export enum FacetCutAction {
    Add = 0,
    Replace = 1,
    Remove = 2,
}

export const diamondSelectors = [
    '0x1f931c1c',
    '0xadfca15e',
    '0x7a0ed627',
    '0xcdffacc6',
    '0x52ef6b2c',
    '0x01ffc9a7',
    '0xf2fde38b',
    '0x8da5cb5b',
]; // We don't update these selectors as it breaks the diamond.

function getDiamondCutsFromSelectorsMap(map: Map<string, string>, action: FacetCutAction) {
    const result = [];
    for (const facetAddress of uniq([...map.values()])) {
        result.push({
            facetAddress,
            action: action,
            functionSelectors: [...map].filter(([, address]) => facetAddress === address).map(([selector]) => selector),
        });
    }
    return result;
}

export function getDiamondCutForContractFacets(newContracts: Contract[], facets: any[]) {
    const currentSelectorMapping = new Map();
    facets.forEach((facet: any) =>
        facet.functionSelectors.forEach((selector: string) => {
            currentSelectorMapping.set(selector, facet.facetAddress);
        }),
    );

    const additions = new Map();
    for (const contract of newContracts) {
        getSelectors(contract).forEach((selector: string) => {
            additions.set(selector, contract.options.address);
        });
    }

    const replaces = new Map();
    const deletions = new Map();

    for (const currentSelector of currentSelectorMapping) {
        if (additions.has(currentSelector[0])) {
            // If the selector address has changed in the new version.
            if (
                additions.get(currentSelector[0]) !== currentSelector[1] &&
                !diamondSelectors.includes(currentSelector[0])
            ) {
                replaces.set(currentSelector[0], additions.get(currentSelector[0]));
            }
            // The selector already exists so it's not an addition.
            additions.delete(currentSelector[0]);
        } else {
            // The selector doesn't exist in the new contracts anymore, remove it.
            deletions.set(currentSelector[0], ADDRESS_ZERO);
        }
    }

    const diamondCuts = [];

    diamondCuts.push(...getDiamondCutsFromSelectorsMap(replaces, FacetCutAction.Replace));
    diamondCuts.push(...getDiamondCutsFromSelectorsMap(deletions, FacetCutAction.Remove));
    diamondCuts.push(...getDiamondCutsFromSelectorsMap(additions, FacetCutAction.Add));

    return diamondCuts;
}

export const updateDiamondContract = async (
    chainId: ChainId,
    contract: Contract,
    variant: DiamondVariant,
    version?: string,
) => {
    const facets = await contract.methods.facets().call();
    const newContracts = diamondContracts(chainId, variant, version);
    const diamondCuts = getDiamondCutForContractFacets(newContracts, facets);

    if (diamondCuts.length > 0) {
        return TransactionService.send(
            contract.options.address,
            contract.methods.diamondCut(diamondCuts, ADDRESS_ZERO, '0x'),
            chainId,
        );
    }

    return false;
};
