// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

interface ISharedWalletFacet {
    function approveERC20(
        address _tokenAddress,
        address _address,
        uint256 _amount
    ) external;

    function approveERC721(
        address _tokenAddress,
        address _address,
        uint256 _tokenId
    ) external;

    function transferERC20(
        address _tokenAddress,
        address _to,
        uint256 _amount
    ) external;

    function transferERC721(
        address _tokenAddress,
        address _to,
        uint256 _tokenId
    ) external;

    function onERC721Received(
        address, 
        address, 
        uint256, 
        bytes calldata
    ) external pure returns (bytes4);
}
