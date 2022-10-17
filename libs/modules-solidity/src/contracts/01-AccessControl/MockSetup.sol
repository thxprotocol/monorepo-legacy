// SPDX-License-Identifier: Apache-2.0
// source: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/AccessControl.sol

import './AccessControl.sol';

pragma solidity >=0.6.0 <0.8.0;

contract MockSetup is AccessControl {
    function setupMockAccess(bytes32[] memory roles, address[] memory addr) public {
        require(roles.length == addr.length, 'UNEQUAL');
        for (uint256 i = 0; i < roles.length; i++) {
            _setupRole(roles[i], addr[i]);
        }
    }
}
