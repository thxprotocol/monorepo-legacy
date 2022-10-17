// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

interface IMemberID {
    event MemberAddressChanged(uint256 indexed memberID, address indexed previousAddress, address indexed newAddress);

    function upgradeAddress(address _oldAddress, address _newAddress) external;

    function getAddressByMember(uint256 _member) external view returns (address);

    function getMemberByAddress(address _address) external view returns (uint256);
}
