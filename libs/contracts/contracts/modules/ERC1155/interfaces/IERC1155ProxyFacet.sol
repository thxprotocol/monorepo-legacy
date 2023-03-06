// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

interface IERC1155ProxyFacet {
    event ERC1155MintedSingle(address recipient, uint256 _id, uint256 amount, address _tokenAddress);
    event ERC1155MintedBatch(address recipient, uint256[] _ids, uint256[] amounts, address _tokenAddress);
    event ERC71155TransferredSingle(address from, address to, uint256 _id, uint256 amount);
    event ERC71155TransferredBatch(address from, address to, uint256[] _ids, uint256[] amounts);

    function mintForERC1155(
        address _tokenAddress,
        address _recipient,
        uint256 _id,
        uint256 _amount
    ) external;

    function mintBatchForERC1155(
        address _tokenAddress,
        address _recipient,
        uint256[] memory _ids,
        uint256[] memory _amounts
    ) external;

    function transferFromERC1155(
        address _tokenAddress,
        address _to,
        uint256 _id,
        uint256 _amount
    ) external;

    /**
     * @dev See {IERC1155-safeBatchTransferFrom}.
     */
    function batchTransferFromERC1155(
        address _tokenAddress,
        address _to,
        uint256[] memory _ids,
        uint256[] memory _amounts
    ) external;
}
