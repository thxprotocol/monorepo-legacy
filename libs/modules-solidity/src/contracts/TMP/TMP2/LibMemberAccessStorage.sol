// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

library LibMemberAccessStorage {
    bytes32 constant MEMBER_ACCESS_STORAGE_POSITION = keccak256('diamond.standard.member.access.storage');

    struct MemberStorage {
        uint256 memberCounter;
        mapping(address => uint256) addressToMember;
        mapping(uint256 => address) memberToAddress;
    }

    function memberStorage() internal pure returns (MemberStorage storage rs) {
        bytes32 position = MEMBER_ACCESS_STORAGE_POSITION;
        assembly {
            rs.slot := position
        }
    }
}
