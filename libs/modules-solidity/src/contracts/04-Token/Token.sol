// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;

/******************************************************************************\
* @title Asset Pool ERC20 asset type.
* @author Evert Kors <evert@thx.network>
* @notice Connect and deposit ERC20 assets.
* 
* Implementations: 
* TMP-5 Token: https://github.com/thxprotocol/modules/issues/5
/******************************************************************************/

import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

import 'diamond-2/contracts/libraries/LibDiamond.sol';

import '../PoolRegistry/IPoolRegistry.sol';
import '../TMP/RelayReceiver.sol';
import '../TMP/TMP5/IToken.sol';
import '../TMP/TMP5/LibTokenStorage.sol';

contract Token is IToken, RelayReceiver {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /**
     * @notice Sets registry address for the asset pool.
     * @param _registry Address of the registry contract.
     * @dev Registry contains general pool settings and will be governable at some point.
     */
    function setPoolRegistry(address _registry) external override {
        LibDiamond.enforceIsContractOwner();
        LibTokenStorage.tokenStorage().registry = _registry;
        emit RegistryUpdated(address(0), _registry);
    }

    /**
     * @return address of the registry contract of the asset pool.
     */
    function getPoolRegistry() external view override returns (address) {
        return LibTokenStorage.tokenStorage().registry;
    }

    /**
     * @return pool token balance for the asset pool
     */
    function getBalance() external view override returns (uint256) {
        return LibTokenStorage.tokenStorage().balance;
    }

    /**
     * @notice Calculates the deposit fee over the amount and substracts of the total. Fee is transfered to FeeCollector address as stored in the registry.
     * @param _amount Deposit amount to transfer to the pool.
     * @dev Make sure a transfer for the given amount is approved before calling.
     */
    function deposit(uint256 _amount) external override {
        require(_amount > 0, 'ZERO_AMOUNT');
        LibTokenStorage.TokenStorage storage s = LibTokenStorage.tokenStorage();

        IPoolRegistry registry = IPoolRegistry(s.registry);

        uint256 fee = _amount.mul(registry.feePercentage()).div(10**18);
        uint256 amount = _amount.sub(fee);

        if (fee > 0) {
            s.token.safeTransferFrom(_msgSender(), registry.feeCollector(), fee);
            emit DepositFeeCollected(fee);
        }
        s.balance = s.balance.add(amount);
        s.token.safeTransferFrom(_msgSender(), address(this), amount);
        emit Depositted(_msgSender(), amount);
    }

    /**
     * @param _token Address of the ERC20 contract to use in the asset pool.
     * @dev Can only be set once.
     */
    function addToken(address _token) external override {
        require(LibTokenStorage.tokenStorage().token == IERC20(0), 'INIT');
        require(_token != address(0), 'ZERO');

        LibDiamond.enforceIsContractOwner();
        LibTokenStorage.tokenStorage().token = IERC20(_token);
        emit TokenUpdated(address(0), _token);
    }

    /// @return address of the ERC20 contract used in the asset pool.
    function getToken() external view override returns (address) {
        return address(LibTokenStorage.tokenStorage().token);
    }
}
