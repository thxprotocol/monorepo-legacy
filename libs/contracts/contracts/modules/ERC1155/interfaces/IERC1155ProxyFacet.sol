// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

interface IERC1155ProxyFacet {
    event ERC71155TransferredSingle(address from, address to, uint256 tokenId, uint256 amount, bytes data);
    event ERC71155TransferredBatch(address from, address to, uint256[] tokenIds, uint256[] amounts, bytes data);
    /**
     * @dev See {IERC1155-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external;

    /**
     * @dev See {IERC1155-safeBatchTransferFrom}.
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external;
    
}