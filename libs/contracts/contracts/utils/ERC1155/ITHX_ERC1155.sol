// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';

interface ITHX_ERC1155 is IERC1155 {
    function mint(address to, uint256 id, uint256 amount, bytes memory data) external;
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external;
}