// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.6;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';

contract SharedWallet is Initializable, AccessControlUpgradeable, OwnableUpgradeable {
    using SafeERC20Upgradeable for IERC20Upgradeable;
    bytes32 public constant MANAGER_ROLE = keccak256('MANAGER_ROLE');

    modifier onlyManager() {
        require(hasRole(MANAGER_ROLE, _msgSender()), "Caller is not a manager");
        _;
    }
    /**
     * @param _owner Address of the Owner contract.
     */
    function initialize(address _owner) public initializer {
          __Ownable_init();
          transferOwnership(_owner);
          _grantRole(MANAGER_ROLE, _owner);
    }

    function approveERC20(address _tokenAddress, address _address, uint256 _amount) external onlyManager {
        IERC20Upgradeable(_tokenAddress).approve(_address, _amount);
    }

    function approveERC721(address _tokenAddress, address _address, uint256 _tokenId) external onlyManager {
        IERC721Upgradeable erc721Token = IERC721Upgradeable(_tokenAddress); 
        require(erc721Token.ownerOf(_tokenId) == _msgSender(), 'Sender is not the owner of the token');
        erc721Token.approve(_address, _tokenId);
    }

    function transferERC20(address _tokenAddress, address _to, uint256 _amount) external onlyManager {
        IERC20Upgradeable erc20Token = IERC20Upgradeable(_tokenAddress);
        require(erc20Token.balanceOf(_msgSender()) >= _amount, 'INSUFFICIENT BALANCE');
        erc20Token.safeTransferFrom(_msgSender(), _to, _amount);
    }

    function transferERC721(address _tokenAddress, address _to, uint256 _tokenId) external onlyManager {
        IERC721Upgradeable erc721Token = IERC721Upgradeable(_tokenAddress);
        require(erc721Token.ownerOf(_tokenId) == _msgSender(), 'Sender is not the owner of the token');
        erc721Token.safeTransferFrom(_msgSender(), _to, _tokenId);
    }

    /**
     * @notice Grants a role to a given account address if sender is contract owner.
     * @param role Bytes32 array representing the role.
     * @param account Address of the account that is given the role.
     */
    function grantRole(bytes32 role, address account) override public onlyOwner {
        _grantRole(role, account);
    }

    /**
     * @notice Revokes the role for a given account address if sender is contract owner
     * @param role Bytes32 array representing the role.
     * @param account Address of the account
     */
    function revokeRole(bytes32 role, address account) override public onlyOwner {
        _revokeRole(role, account);
    }
}