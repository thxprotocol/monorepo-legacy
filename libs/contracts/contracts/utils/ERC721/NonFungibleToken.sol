// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import './INonFungibleToken.sol';

contract NonFungibleToken is INonFungibleToken, ERC721, AccessControl, Ownable {
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        address owner_
    ) ERC721(name_, symbol_) {
        transferOwnership(owner_);
        _setupRole(DEFAULT_ADMIN_ROLE, owner_);
        _setupRole(MINTER_ROLE, owner_);
        _setBaseURI(baseURI_);
    }

    function mint(address _recipient, string memory _tokenURI) external override returns (uint256) {
        require(hasRole(MINTER_ROLE, msg.sender), 'NOT_MINTER');

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(_recipient, newItemId);
        _setTokenURI(newItemId, _tokenURI);

        return newItemId;
    }
}
