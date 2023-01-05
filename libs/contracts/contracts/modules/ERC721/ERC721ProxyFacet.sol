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
     * @param _recipient Address of recipient for this token
     * @param _tokenUri URI of the token
     * @param _tokenAddress Address of the token
     */
    function mintFor(
        address _recipient,
        string memory _tokenUri,
        address _tokenAddress
    ) external override onlyOwner {
        require(_tokenAddress != address(0), 'NO_TOKEN');

        INonFungibleToken nft = INonFungibleToken(_tokenAddress);
        uint256 tokenId = nft.mint(_recipient, _tokenUri);

        emit ERC721Minted(_recipient, tokenId, _tokenAddress);
    }

    /**
     * @param _to Address of the receiver
     * @param _tokenId ID of the token
     * @param _tokenAddress Address of the token contract
     */
    function transferFromERC721(
        address _to,
        uint256 _tokenId,
        address _tokenAddress
    ) external override onlyOwner {
        require(_tokenAddress != address(0), 'NO_TOKEN');

        INonFungibleToken nft = INonFungibleToken(_tokenAddress);
        nft.safeTransferFrom(address(this), _to, _tokenId);

        emit ERC721Transferred(address(this), _to, _tokenId, _tokenAddress);
    }
}
