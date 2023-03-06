// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

/******************************************************************************\
* @title ERC1155 Connector
* @author Peter Polman <peter@thx.network>
* @notice Connect ERC1155 token contract.
/******************************************************************************/
import 'diamond-2/contracts/libraries/LibDiamond.sol';
import './interfaces/IERC1155ProxyFacet.sol';

import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import '../../utils/ERC1155/ITHX_ERC1155.sol';
import '../../utils/Access.sol';

contract ERC1155ProxyFacet is Access, IERC1155ProxyFacet {
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');

    function mintForERC1155(
        address _tokenAddress,
        address _recipient,
        uint256 _id,
        uint256 _amount
    ) external override onlyOwner {
        require(_tokenAddress != address(0), 'NO_TOKEN');

        ITHX_ERC1155 erc115 = ITHX_ERC1155(_tokenAddress);
        erc115.mint(_recipient, _id, _amount, '');

        emit ERC1155MintedSingle(_recipient, _id, _amount, _tokenAddress);
    }

    function mintBatchForERC1155(
        address _tokenAddress,
        address _recipient,
        uint256[] memory _ids,
        uint256[] memory _amounts
    ) external override onlyOwner {
        require(_tokenAddress != address(0), 'NO_TOKEN');

        ITHX_ERC1155 erc115 = ITHX_ERC1155(_tokenAddress);
        erc115.mintBatch(_recipient, _ids, _amounts, '');

        emit ERC1155MintedBatch(_recipient, _ids, _amounts, _tokenAddress);
    }

    function transferFromERC1155(
        address _tokenAddress,
        address _to,
        uint256 _id,
        uint256 _amount
    ) external override onlyOwner {
        require(_tokenAddress != address(0), 'NO_TOKEN');

        ITHX_ERC1155 erc115 = ITHX_ERC1155(_tokenAddress);
        erc115.safeTransferFrom(address(this), _to, _id, _amount, '');

        emit ERC71155TransferredSingle(address(this), _to, _id, _amount);
    }

    function batchTransferFromERC1155(
        address _tokenAddress,
        address _to,
        uint256[] memory _ids,
        uint256[] memory _amounts
    ) external override onlyOwner {
        require(_tokenAddress != address(0), 'NO_TOKEN');

        ITHX_ERC1155 erc115 = ITHX_ERC1155(_tokenAddress);
        erc115.safeBatchTransferFrom(address(this), _to, _ids, _amounts, '');

        emit ERC71155TransferredBatch(address(this), _to, _ids, _amounts);
    }
}
