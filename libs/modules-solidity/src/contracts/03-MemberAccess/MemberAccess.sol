// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.4;

/******************************************************************************\
* @title Member Access Control
* @author Evert Kors <evert@thx.network>
* @notice Manage access control for MEMBER, MANAGER and OWNER roles.
* 
* Dependencies:
* TMP-1 Access Control: https://github.com/thxprotocol/modules/issues/1
* 
* Implementations: 
* TMP-2 Member ID: https://github.com/thxprotocol/modules/issues/2
* TMP-3 Pool Roles: https://github.com/thxprotocol/modules/issues/3
/******************************************************************************/

import '@openzeppelin/contracts/utils/EnumerableSet.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';
import '../01-AccessControl/AccessControl.sol';

// depends on
import '../TMP/TMP1/IAccessControlEvents.sol';
import '../TMP/TMP1/LibAccessStorage.sol';

// implements
import '../TMP/TMP2/IMemberID.sol';
import '../TMP/TMP2/LibMemberAccessStorage.sol';
import '../TMP/TMP3/IPoolRoles.sol';

import '../TMP/RelayReceiver.sol';

contract MemberAccess is IMemberID, IPoolRoles, RelayReceiver, IAccessControlEvents {
    /**
     * @param _owner Address of the account that should own the contract.
     * @dev Should be called right after deploying the contract. _owner will become member, manager and role admin.
     */
    function initializeRoles(address _owner) external override {
        require(LibMemberAccessStorage.memberStorage().memberCounter == 0, 'INIT');

        LibMemberAccessStorage.memberStorage().memberCounter = 1000;
        _setupRole(DEFAULT_ADMIN_ROLE, _owner);
        _setupRole(MEMBER_ROLE, _owner);
        _setupRole(MANAGER_ROLE, _owner);
        setupMember(_owner);
    }

    /**
     * @param _account Address of the account to check the member role for.
     * @return if the given address bears the member role.
     */
    function isMember(address _account) external view override returns (bool) {
        return _isMember(_account);
    }

    /**
     * @param _account Address of the account to give the member role to.
     */
    function addMember(address _account) external override {
        require(_hasRole(MANAGER_ROLE, _msgSender()) || _hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), 'ACCESS');
        setupMember(_account);
        _grantRole(MEMBER_ROLE, _account);
    }

    /**
     * @param _account Address of the account to revoke the member role for.
     */
    function removeMember(address _account) external override {
        require(_hasRole(MANAGER_ROLE, _msgSender()) || _hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), 'ACCESS');
        _revokeRole(MEMBER_ROLE, _account);
    }

    /**
     * @param _account Address of the account to check the manager role for.
     * @return if the given address bears the manager role.
     */
    function isManager(address _account) external view override returns (bool) {
        return _isManager(_account);
    }

    /**
     * @param _account Address of the account to give the manager role to.
     */
    function addManager(address _account) external override {
        require(_hasRole(MANAGER_ROLE, _msgSender()) || _hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), 'ACCESS');
        setupMember(_account);
        _grantRole(MANAGER_ROLE, _account);
    }

    /**
     * @param _account Address of the account to revoke the manager role for.
     */
    function removeManager(address _account) external override {
        require(_hasRole(MANAGER_ROLE, _msgSender()) || _hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), 'ACCESS');
        require(_msgSender() != _account, 'OWN_ACCOUNT');
        _revokeRole(MANAGER_ROLE, _account);
    }

    /**
     * @param _account Address of the account to check the manager role admin account for.
     * @return if the given address is the manager role admin.
     */
    function isManagerRoleAdmin(address _account) external view override returns (bool) {
        return _hasRole(LibAccessStorage.roleStorage().roles[MANAGER_ROLE].adminRole, _account);
    }

    /**
     * @param _account Address of the account to check the member role admin account for.
     * @return if the given address is the member role admin.
     */
    function isMemberRoleAdmin(address _account) external view override returns (bool) {
        return _hasRole(LibAccessStorage.roleStorage().roles[MEMBER_ROLE].adminRole, _account);
    }

    /**
     * @return address of the contract owner.
     */
    function getOwner() external view override returns (address) {
        return _getOwner();
    }

    /**
     * @notice Upgrades an existing member address to a new member address, can only be called by the member itself.
     * @param _oldAddress The current address of the member.
     * @param _newAddress The new address of the member.
     * @dev Different member id's can map to the same address.
     */
    function upgradeAddress(address _oldAddress, address _newAddress) external override {
        require(_oldAddress == _msgSender(), 'OLD_NOT_SENDER');
        LibMemberAccessStorage.MemberStorage storage ms = LibMemberAccessStorage.memberStorage();
        uint256 member = ms.addressToMember[_oldAddress];
        require(member != 0, 'NON_MEMBER');
        ms.addressToMember[_oldAddress] = 0;
        ms.addressToMember[_newAddress] = member;
        ms.memberToAddress[member] = _newAddress;

        if (_hasRole(MEMBER_ROLE, _oldAddress)) {
            _revokeRole(MEMBER_ROLE, _oldAddress);
            _grantRole(MEMBER_ROLE, _newAddress);
        }

        if (_hasRole(MANAGER_ROLE, _oldAddress)) {
            _revokeRole(MANAGER_ROLE, _oldAddress);
            _grantRole(MANAGER_ROLE, _newAddress);
        }
        emit MemberAddressChanged(member, _oldAddress, _newAddress);
    }

    /**
     * @notice Upgrades an existing member address to a new member address, can only be called by the member itself.
     * @param _member The index of the member account.
     * @dev Different member id's can map to the same address.
     * @return Address of the member for the given member index in the memberToAddress storage.
     */
    function getAddressByMember(uint256 _member) external view override returns (address) {
        return LibMemberAccessStorage.memberStorage().memberToAddress[_member];
    }

    /**
     * @param _address The address of the member account.
     * @return Index of the member for a given address.
     */
    function getMemberByAddress(address _address) external view override returns (uint256) {
        return LibMemberAccessStorage.memberStorage().addressToMember[_address];
    }

    /**
     * @param _account Address of the member.
     * @dev Called during initilization.
     */
    function setupMember(address _account) internal {
        LibMemberAccessStorage.MemberStorage storage ms = LibMemberAccessStorage.memberStorage();
        uint256 member = ms.addressToMember[_account];
        if (member != 0) {
            //member is already setup
            return;
        }
        ms.memberCounter += 1;
        ms.addressToMember[_account] = ms.memberCounter;
        ms.memberToAddress[ms.memberCounter] = _account;
    }

    //
    // Access control view methods internal
    //
    using EnumerableSet for EnumerableSet.AddressSet;
    using Address for address;

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
            emit RoleGranted(role, account, _msgSender());
        }
    }

    /**
     * @param role Bytes32 array representing the role.
     * @param account Address of the account
     */
    function _revokeRole(bytes32 role, address account) internal virtual {
        LibAccessStorage.RoleStorage storage rs = LibAccessStorage.roleStorage();

        if (rs.roles[role].members.remove(account)) {
            emit RoleRevoked(role, account, _msgSender());
        }
    }

    //
    // Pool roles view methods internal
    //
    bytes32 internal constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 internal constant MEMBER_ROLE = keccak256('MEMBER_ROLE');
    bytes32 internal constant MANAGER_ROLE = keccak256('MANAGER_ROLE');

    function _isManager(address _account) internal view returns (bool) {
        return _hasRole(MANAGER_ROLE, _account);
    }

    function _isMember(address _account) internal view returns (bool) {
        return _hasRole(MEMBER_ROLE, _account) || _hasRole(MANAGER_ROLE, _account);
    }

    function _getOwner() internal view returns (address) {
        return LibDiamond.contractOwner();
    }
}
