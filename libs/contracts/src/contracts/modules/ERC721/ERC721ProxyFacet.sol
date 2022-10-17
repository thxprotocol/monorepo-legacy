// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;

/******************************************************************************\
* @title ERC721 Connector
* @author Peter Polman <peter@thx.network>
* @notice Connect ERC721 token contract.
/******************************************************************************/

import '@openzeppelin/contracts/math/SafeMath.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';
import './interfaces/IERC721ProxyFacet.sol';
import './lib/LibERC721Storage.sol';
import '../../utils/ERC721/INonFungibleToken.sol';
import '../../utils/Access.sol';

contract ERC721ProxyFacet is Access, IERC721ProxyFacet {
    using SafeMath for uint256;

    /**
     * @param _token Address of the ERC721 contract to connect to this pool.
     * @dev Can only be set once.
     */
    function setERC721(address _token) external override onlyOwner {
        require(LibERC721Storage.s().token == INonFungibleToken(0), 'INIT');
        require(_token != address(0), 'ZERO');

        LibERC721Storage.s().token = INonFungibleToken(_token);

        emit ERC721Updated(address(0), _token);
    }

    /// @return address of the ERC721 contract used in the asset pool.
    function getERC721() external view override returns (address) {
        return address(LibERC721Storage.s().token);
    }

    /**
     * @param _recipient Address of recipient for this token
     * @param _tokenUri URI of the token
     */
    function mintFor(address _recipient, string memory _tokenUri) external override onlyOwner {
        LibERC721Storage.ERC721Storage storage s = LibERC721Storage.s();
        require(s.token != INonFungibleToken(0), 'NO_TOKEN');

        INonFungibleToken nft = INonFungibleToken(LibERC721Storage.s().token);
        uint256 tokenId = nft.mint(_recipient, _tokenUri);

        emit ERC721Minted(_recipient, tokenId);
    }
}
