// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

interface IERC1155HolderProxyFacet {

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) external returns (bytes4);

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) external returns (bytes4);
}