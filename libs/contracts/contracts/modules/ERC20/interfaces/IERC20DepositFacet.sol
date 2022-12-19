// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

interface IERC20DepositFacet {
    event ERC20DepositFeeCollected(uint256 fee);
    event ERC20DepositFrom(address sender, uint256 amount, address tokneAddress);

    function depositFrom(address _sender, uint256 _amount, address tokneAddress) external;

    function depositFromMany(address[] memory _senders, uint256[] memory _amounts, address[] calldata tokenAddresses) external;
}
