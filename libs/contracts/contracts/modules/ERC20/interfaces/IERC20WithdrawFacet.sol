// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

interface IERC20WithdrawFacet {
    event ERC20WithdrawFeeCollected(uint256 fee);
    event ERC20WithdrawFor(address receiver, uint256 amount);

    function withdrawFor(address _receiver, uint256 _amount) external;

    function withdrawForMany(address[] memory _receivers, uint256[] memory _amounts) external;
}
