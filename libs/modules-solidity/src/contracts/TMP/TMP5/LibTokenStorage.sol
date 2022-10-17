// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

library LibTokenStorage {
    bytes32 constant TOKEN_STORAGE_POSITION = keccak256('diamond.standard.token.storage');

    struct TokenStorage {
        address registry;
        uint256 balance;
        IERC20 token;
    }

    function tokenStorage() internal pure returns (TokenStorage storage ts) {
        bytes32 position = TOKEN_STORAGE_POSITION;
        assembly {
            ts.slot := position
        }
    }
}
