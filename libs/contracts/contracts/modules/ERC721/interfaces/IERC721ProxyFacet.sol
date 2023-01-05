// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

interface IERC721ProxyFacet {
    event ERC721Transferred(address from, address to, uint256 tokenId, address tokenAddress);
    event ERC721Minted(address recipient, uint256 tokenId, address _tokenAddress);

    function mintFor(
        address recipient,
        string memory tokenUri,
        address _tokenAddress
    ) external;

    function transferFromERC721(
        address _to,
        uint256 _tokenId,
        address _tokenAddress
    ) external;
}
