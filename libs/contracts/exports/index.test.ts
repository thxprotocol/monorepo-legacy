import { contractConfig, availableVersions, diamondFacetConfigs } from '.';

console.log(contractConfig('matic', 'AccessControlFacet', '1.0.9'));
console.log(availableVersions('matic'));
console.log(diamondFacetConfigs('matic', 'defaultDiamond'));
