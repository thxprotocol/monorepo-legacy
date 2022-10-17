// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

import '../../../utils/ERC721/INonFungibleToken.sol';

library LibERC721Storage {
    bytes32 constant ERC721_STORAGE_POSITION = keccak256('diamond.standard.erc721connect.storage');

    struct ERC721Storage {
        address registry;
        INonFungibleToken token;
    }

    function s() internal pure returns (ERC721Storage storage store) {
        bytes32 position = ERC721_STORAGE_POSITION;
        assembly {
            store.slot := position
        }
    }
}
