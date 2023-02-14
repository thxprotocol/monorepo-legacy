// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

import '../../../utils/ERC1155/ITHX_ERC1155.sol';

library LibERC1155Storage {
    bytes32 constant ERC1155_STORAGE_POSITION = keccak256('diamond.standard.erc1155.storage');

    struct ERC1155Storage {
        address registry;
        ITHX_ERC1155 multiToken;
    }

    function s() internal pure returns (ERC1155Storage storage store) {
        bytes32 position = ERC1155_STORAGE_POSITION;
        assembly {
            store.slot := position
        }
    }
}
