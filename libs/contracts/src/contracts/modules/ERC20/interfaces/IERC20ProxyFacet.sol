// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

interface IERC20ProxyFacet {
    event ERC20ProxyUpdated(address old, address current);
    event ERC20ProxyFeeCollected(uint256 fee);
    event ERC20ProxyTransferFrom(address sender, address recipient, uint256 amount);

    function setERC20(address _token) external;

    function getERC20() external view returns (address);

    function totalSupply() external view returns (uint256);

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function balanceOf(address _account) external view returns (uint256);

    function transferFrom(
        address _sender,
        address _recipient,
        uint256 _amount
    ) external;

    function transferFromMany(
        address[] memory _senders,
        address[] memory _recipients,
        uint256[] memory _amounts
    ) external;
}
