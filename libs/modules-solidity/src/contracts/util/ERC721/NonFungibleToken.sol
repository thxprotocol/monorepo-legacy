// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

/******************************************************************************\
* @title ERC721 URI Storage
* @author Peter Polman <peter@thx.network>
* @notice Used for point systems with a limited supply. Mints the full supply to the to argument given in the contructor. 
* @dev Not upgradable contract.
/******************************************************************************/

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract NonFungibleToken is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(
        string memory name_,
        string memory symbol_,
        address owner_,
        string memory baseURI_
    ) ERC721(name_, symbol_) {
        transferOwnership(owner_);
        _setBaseURI(baseURI_);
    }

    function mint(address recipient, string memory tokenURI) external onlyOwner returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}
