// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

library LibRelayHubStorage {
    bytes32 constant RELAYHUB_STORAGE_POSITION = keccak256('diamond.standard.relayhub.storage');

    struct RHStorage {
        address admin;
        mapping(address => uint256) signerNonce;
        uint256 lockCounter;
        bool enabled;
    }

    function rhStorage() internal pure returns (RHStorage storage bs) {
        bytes32 position = RELAYHUB_STORAGE_POSITION;
        assembly {
            bs.slot := position
        }
    }
}
