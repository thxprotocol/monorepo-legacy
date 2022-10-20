// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.6;

/******************************************************************************\
* @title ERC20 Unlimited Supply
* @author Evert Kors <evert@thx.network>
* @notice Used for point systems with an unlimited supply. Mints the required tokens whenever they are needed.
* @dev Not upgradable contract.
/******************************************************************************/

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

contract UnlimitedSupplyToken is ERC20, AccessControl, Ownable {
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');

    constructor(
        string memory name_,
        string memory symbol_,
        address owner_
    ) ERC20(name_, symbol_) {
        transferOwnership(owner_);
        _setupRole(DEFAULT_ADMIN_ROLE, owner_);
        _setupRole(MINTER_ROLE, owner_);
    }

    function _beforeTokenTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) internal override {
        if (hasRole(MINTER_ROLE, _from)) {
            _mint(_from, _amount);
        }
    }
}
