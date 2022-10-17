// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

interface IERC20SwapFacet {
    event ERC20SwapRuleUpdated(address tokenAddress, uint256 multiplier);
    event ERC20SwapFeeCollected(uint256 amount);
    event ERC20SwapFor(address sender, uint256 amountIn, uint256 amountOut, address tokenIn, address tokenOut);

    function setSwapRule(address _tokenAddress, uint256 multiplier) external;

    function getSwapRule(address _tokenAddress) external view returns (uint256);

    function swapFor(
        address _sender,
        uint256 _amountIn,
        address _tokenAddress
    ) external;
}
