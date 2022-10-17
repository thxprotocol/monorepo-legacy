// SPDX-License-Identifier: Apache-2.0
// source: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/AccessControl.sol

pragma solidity >=0.6.0 <0.8.0;

import '@openzeppelin/contracts/utils/EnumerableSet.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import './interfaces/IAccessControlFacet.sol';
import './lib/LibAccessStorage.sol';
import '../../interfaces/IAccessControlEvents.sol';

contract AccessControlFacet is IAccessControlFacet, IAccessControlEvents {
    using EnumerableSet for EnumerableSet.AddressSet;
    using Address for address;

    /**
     * @notice Checks if an address bears a given role.
     * @param role Role to check account for.
     * @param account Account to check the role for.
     * @return if the account bears the role.
     */
    function hasRole(bytes32 role, address account) external view override returns (bool) {
        return _hasRole(role, account);
    }

    /**
     * @notice Gets the amount of members for a role.
     * @param role Role to get the count for.
     * @return the amount of members for the role.
     */
    function getRoleMemberCount(bytes32 role) external view override returns (uint256) {
        return LibAccessStorage.roleStorage().roles[role].members.length();
    }

    /**
     * @notice Gets the member address for a given role.
     * @param role Role of the pool member.
     * @param index Index of the pool member.
     * @return member address.
     */
    function getRoleMember(bytes32 role, uint256 index) external view override returns (address) {
        return LibAccessStorage.roleStorage().roles[role].members.at(index);
    }

    /**
     * @notice Determines what role is required to manage the role.
     * @param role Bytes32 array representing the role
     * @return Bytes32 array of the administrative role for the given role.
     */
    function getRoleAdmin(bytes32 role) external view override returns (bytes32) {
        return LibAccessStorage.roleStorage().roles[role].adminRole;
    }

    /**
     * @notice Grants a role to a given account address.
     * @param role Bytes32 array representing the role.
     * @param account Address of the account that is given the role.
     */
    function grantRole(bytes32 role, address account) external override {
        require(
            _hasRole(LibAccessStorage.roleStorage().roles[role].adminRole, msg.sender),
            'AccessControl: sender must be an admin to grant'
        );
        _grantRole(role, account);
    }

    /**
     * @notice Revokes the role for a given account address if sender is admin of the role.
     * @param role Bytes32 array representing the role.
     * @param account Address of the account
     */
    function revokeRole(bytes32 role, address account) external override {
        require(
            _hasRole(LibAccessStorage.roleStorage().roles[role].adminRole, msg.sender),
            'AccessControl: sender must be an admin to revoke'
        );
        _revokeRole(role, account);
    }

    /**
     * @notice Renounces the role for a given account address if equal to sender address.
     * @param role Bytes32 array representing the role.
     * @param account Address of the account
     */
    function renounceRole(bytes32 role, address account) external override {
        require(account == msg.sender, 'AccessControl: can only renounce roles for self');
        _revokeRole(role, account);
    }

    /**
     * @dev Checks if account bears role.
     * @param role Bytes32 array representing the role.
     * @param account Address of the account
     * @return if role member storage array contains the given account address.
     */
    function _hasRole(bytes32 role, address account) internal view virtual returns (bool) {
        LibAccessStorage.RoleStorage storage rs = LibAccessStorage.roleStorage();

        return rs.roles[role].members.contains(account);
    }

    /**
     * @dev Called in initialize methods.
     * @param role Bytes32 array representing the role.
     * @param account Address of the account
     */
    function _setupRole(bytes32 role, address account) internal virtual {
        _grantRole(role, account);
    }

    /**
     * @dev Called during initialization
     * @param role Bytes32 array representing the role.
     * @param adminRole Address of the role admin
     */
    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual {
        LibAccessStorage.RoleStorage storage rs = LibAccessStorage.roleStorage();

        emit RoleAdminChanged(role, rs.roles[role].adminRole, adminRole);
        rs.roles[role].adminRole = adminRole;
    }

    /**
     * @param role Bytes32 array representing the role.
     * @param account Address of the account
     */
    function _grantRole(bytes32 role, address account) internal virtual {
        LibAccessStorage.RoleStorage storage rs = LibAccessStorage.roleStorage();

        if (rs.roles[role].members.add(account)) {
            emit RoleGranted(role, account, msg.sender);
        }
    }

    /**
     * @param role Bytes32 array representing the role.
     * @param account Address of the account
     */
    function _revokeRole(bytes32 role, address account) internal virtual {
        LibAccessStorage.RoleStorage storage rs = LibAccessStorage.roleStorage();

        if (rs.roles[role].members.remove(account)) {
            emit RoleRevoked(role, account, msg.sender);
        }
    }
}
