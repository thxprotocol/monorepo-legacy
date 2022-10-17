// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

interface IToken {
    event TokenUpdated(address old, address current);
    event RegistryUpdated(address old, address current);
    event DepositFeeCollected(uint256 fee);
    event Depositted(address sender, uint256 amount);

    function getBalance() external view returns (uint256);

    function deposit(uint256 _amount) external;

    function setPoolRegistry(address _registry) external;

    function getPoolRegistry() external view returns (address);

    function addToken(address _token) external;

    function getToken() external view returns (address);
}
