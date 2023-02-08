// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;

/******************************************************************************\
* @title ERC1155 Connector
* @author Peter Polman <peter@thx.network>
* @notice Connect ERC1155 token contract.
/******************************************************************************/

import '@openzeppelin/contracts/math/SafeMath.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';
import './interfaces/IERC1155ProxyFacet.sol';
import './lib/LibERC1155Storage.sol';
import '../../utils/ERC1155/ITHX_ERC5511.sol';
import '../../utils/Access.sol';

contract ERC1155ProxyFacet is Access, IERC1155ProxyFacet {
    using SafeMath for uint256;

    /**
     * @dev See {IERC1155-safeTransferFrom}.
     */
    function safeTransferFrom(
        address _tokenAddress,
        address _to,
        uint256 _tokenIid,
        uint256 _amount,
        bytes memory data
    ) external override onlyOwner {
        require(_tokenAddress != address(0), 'NO_TOKEN');
        
        IITHX_ERC5511 multiToken = IITHX_ERC5511(_tokenAddress);
        multiToken.safeTransferFrom(address(this),  _to, _tokenId, _amount, _data);

        emit ERC71155TransferredSingle(address(this), _to, _tokenId, _amount, _data);
    }

    /**
     * @dev See {IERC1155-safeBatchTransferFrom}.
     */
    function safeBatchTransferFrom(
        address _tokenAddress
        address _to,
        uint256[] memory _tokenIds,
        uint256[] memory _amounts,
        bytes memory _data
    ) public override onlyOwner {
        require(_tokenAddress != address(0), 'NO_TOKEN');

        IITHX_ERC5511 multiToken = IITHX_ERC5511(_tokenAddress);
        multiToken.safeBatchTransferFrom(address(this),  _to, _tokenIds, _amounts, _data)

        emit ERC71155TransferredBatch(address(this), _to, _tokenIds, _amounts, _data);
    }
}
