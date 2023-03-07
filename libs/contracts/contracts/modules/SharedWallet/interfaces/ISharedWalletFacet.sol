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

    function transferERC1155(
        address _tokenAddress,
        address _to,
        uint256 _tokenId,
        uint256 _amount
    ) external;

    function batchTransferERC1155(
        address _tokenAddress,
        address _to,
        uint256[] calldata _tokenIds,
        uint256[] calldata _amounts
    ) external;

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4);

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) external pure returns (bytes4);

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) external pure returns (bytes4);
}
