// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import '../util/ERC20/LimitedSupplyToken.sol';
import '../util/ERC20/UnlimitedSupplyToken.sol';
import '../util/ERC721/NonFungibleToken.sol';
import './ITokenFactory.sol';

import 'diamond-2/contracts/libraries/LibDiamond.sol';

contract TokenFactoryFacet is ITokenFactory {
    /**
     * @param _name string Token name.
     * @param _symbol string Token symbol.
     * @param _to address Address the total supply will be minted to.
     */
    function deployNonFungibleToken(
        string memory _name,
        string memory _symbol,
        address _to,
        string memory _baseURI
    ) external override {
        LibDiamond.enforceIsContractOwner();

        NonFungibleToken t = new NonFungibleToken(_name, _symbol, _to, _baseURI);
        emit TokenDeployed(address(t), TokenType.NonFungible);
    }

    /**
     * @param _name string Token name.
     * @param _symbol string Token symbol.
     * @param to address Address the total supply will be minted to.
     * @param amount uint256 Total supply of this token.
     */
    function deployLimitedSupplyToken(
        string memory _name,
        string memory _symbol,
        address to,
        uint256 amount
    ) external override {
        LibDiamond.enforceIsContractOwner();

        LimitedSupplyToken t = new LimitedSupplyToken(_name, _symbol, to, amount);
        emit TokenDeployed(address(t), TokenType.Limited);
    }

    /**
     * @param _name string Token name.
     * @param _symbol string Token symbol.
     * @param _minters address[] List if address that able to mint new tokens
     * @param _admin address Addres which is allowed to transfer tokens which are minted on the fly.
     */
    function deployUnlimitedSupplyToken(
        string memory _name,
        string memory _symbol,
        address[] memory _minters,
        address _admin
    ) external override {
        LibDiamond.enforceIsContractOwner();

        UnlimitedSupplyToken t = new UnlimitedSupplyToken(_name, _symbol, _minters, _admin);
        emit TokenDeployed(address(t), TokenType.Unlimited);
    }
}
