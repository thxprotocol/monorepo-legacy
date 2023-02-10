// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

/******************************************************************************\
* @title ERC1155 Connector
* @author Peter Polman <peter@thx.network>
* @notice Connect ERC1155 token contract.
/******************************************************************************/
import 'diamond-2/contracts/libraries/LibDiamond.sol';
import './interfaces/IERC1155ProxyFacet.sol';
import './lib/LibERC1155Storage.sol';
import '../../utils/ERC1155/ITHX_ERC1155.sol';
import '../../utils/Access.sol';

contract ERC1155ProxyFacet is Access, IERC1155ProxyFacet {

    function mintERC1155For(address _tokenAddress, address _recipient, uint256 _id, uint256 _amount) external override onlyOwner {
        require(_tokenAddress != address(0), 'NO_TOKEN');
        ITHX_ERC1155 multiToken = ITHX_ERC1155(_tokenAddress);
        multiToken.mint(_recipient, _id, _amount, "");

        emit ERC1155MintedSingle(_recipient, _id, _amount, _tokenAddress);
    }

    function mintERC1155BatchFor(address _tokenAddress, address _recipient, uint256[] memory _ids, uint256[] memory _amounts) external override onlyOwner {
        require(_tokenAddress != address(0), 'NO_TOKEN');
        ITHX_ERC1155 multiToken = ITHX_ERC1155(_tokenAddress);
        multiToken.mintBatch(_recipient, _ids, _amounts, "");

        emit ERC1155MintedBatch(_recipient, _ids, _amounts, _tokenAddress);
    }

    /**
     * @dev See {IERC1155-safeTransferFrom}.
     */
    function transferFromERC1155(
        address _tokenAddress,
        address _to,
        uint256 _tokenId,
        uint256 _amount,
        bytes memory data
    ) external override onlyOwner {
        require(_tokenAddress != address(0), 'NO_TOKEN');
        
        ITHX_ERC1155 multiToken = ITHX_ERC1155(_tokenAddress);
        multiToken.safeTransferFrom(address(this),  _to, _tokenId, _amount, data);

        emit ERC71155TransferredSingle(address(this), _to, _tokenId, _amount);
    }

    /**
     * @dev See {IERC1155-safeBatchTransferFrom}.
     */
    function batchTransferFromERC1155(
        address _tokenAddress,
        address _to,
        uint256[] memory _tokenIds,
        uint256[] memory _amounts,
        bytes memory _data
    ) external override onlyOwner {
        require(_tokenAddress != address(0), 'NO_TOKEN');

        ITHX_ERC1155 multiToken = ITHX_ERC1155(_tokenAddress);
        multiToken.safeBatchTransferFrom(address(this),  _to, _tokenIds, _amounts, _data);

        emit ERC71155TransferredBatch(address(this), _to, _tokenIds, _amounts);
    }
}
