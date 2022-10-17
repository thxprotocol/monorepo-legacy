// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

interface ITokenFactory {
    enum TokenType {
        Limited,
        Unlimited,
        NonFungible
    }
    event TokenDeployed(address token, TokenType tokenType);

    function deployNonFungibleToken(
        string memory _name,
        string memory _symbol,
        address _to,
        string memory _baseURI
    ) external;

    function deployLimitedSupplyToken(
        string memory _name,
        string memory _symbol,
        address to,
        uint256 amount
    ) external;

    function deployUnlimitedSupplyToken(
        string memory _name,
        string memory _symbol,
        address[] memory _minters,
        address _admin
    ) external;
}
