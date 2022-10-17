import { contractConfig, availableVersions, diamondFacetConfigs } from '.';

console.log(contractConfig('mumbai', 'AccessControl', '1.0.9'));
console.log(availableVersions('mumbai'));
console.log(diamondFacetConfigs('mumbai', 'defaultPool'));
