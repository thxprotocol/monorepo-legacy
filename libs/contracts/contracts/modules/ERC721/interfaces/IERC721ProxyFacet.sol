// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

interface IERC721ProxyFacet {
    event ERC721Updated(address old, address current);
    event ERC721Minted(address recipient, uint256 tokenId);

    function setERC721(address _token) external;

    function getERC721() external view returns (address);

    function mintFor(address recipient, string memory tokenUri) external;
}
