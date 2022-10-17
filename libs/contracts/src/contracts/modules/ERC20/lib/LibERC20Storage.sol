// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

// diamond storage structs
// https://dev.to/mudgen/how-diamond-storage-works-90e#:~:text=Diamond%20storage%20is%20a%20contract,easy%20to%20read%20and%20write.

library LibERC20Storage {
    bytes32 constant TOKEN_STORAGE_POSITION = keccak256('diamond.standard.token.storage');

    struct ERC20Storage {
        address registry; // no longer used but cannot be removed as per diamond storage struct usage
        uint256 balance; // balance is not used but cannot be removed as per diamond storage struct usage
        IERC20 token;
        mapping(address => uint256) multipliers;
    }

    function s() internal pure returns (ERC20Storage storage store) {
        bytes32 position = TOKEN_STORAGE_POSITION;
        assembly {
            store.slot := position
        }
    }
}
