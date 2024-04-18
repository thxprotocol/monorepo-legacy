// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

interface IWeightedPool is IERC20 {
    function setVault(address _vault) external;
    function getVault() external view returns (address);
    function getPoolId() external view returns (bytes32);
}

contract BPT is ERC20, IWeightedPool {
    address public vault;

    constructor(address _to, uint256 _amount) ERC20('20USDC-80THX', '20USDC-80THX') {
        _mint(_to, _amount);
    }
 
    function setVault(address _vault) external override {
        vault = _vault;
    }
    
    function getVault() external override view returns (address) {
        return vault;
    }
    
    function getPoolId() external override pure returns (bytes32) {
        return 0xb204bf10bc3a5435017d3db247f56da601dfe08a0002000000000000000000fe;
    }
}
