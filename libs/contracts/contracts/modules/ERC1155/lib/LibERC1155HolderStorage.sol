// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC1155/ERC1155Holder.sol';

library LibERC1155HolderStorage {
    bytes32 constant ERC1155Holder_STORAGE_POSITION = keccak256('diamond.standard.erc1155holder.storage');

    struct ERC1155HolderStorage {
        address registry;
        ERC1155Holder erc155holder;
    }

    function s() internal pure returns (ERC1155HolderStorage storage store) {
        bytes32 position = ERC1155Holder_STORAGE_POSITION;
        assembly {
            store.slot := position
        }
    }
}
