// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

// diamond storage structs
// https://dev.to/mudgen/how-diamond-storage-works-90e#:~:text=Diamond%20storage%20is%20a%20contract,easy%20to%20read%20and%20write.

library LibRegistryProxyStorage {
    bytes32 constant TOKEN_STORAGE_POSITION = keccak256('diamond.standard.registryproxy.storage');

    struct RegistryProxyStorage {
        address registry;
    }

    function s() internal pure returns (RegistryProxyStorage storage store) {
        bytes32 position = TOKEN_STORAGE_POSITION;
        assembly {
            store.slot := position
        }
    }
}
