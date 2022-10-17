// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import 'diamond-2/contracts/interfaces/IERC173.sol';
import 'diamond-2/contracts/interfaces/IDiamondLoupe.sol';
import 'diamond-2/contracts/interfaces/IDiamondCut.sol';
import '../modules/Registry/interfaces/IRegistryProxyFacet.sol';
import '../modules/ERC20/interfaces/IERC20ProxyFacet.sol';
import '../modules/ERC20/interfaces/IERC20SwapFacet.sol';
import '../modules/ERC20/interfaces/IERC20DepositFacet.sol';
import '../modules/ERC20/interfaces/IERC20WithdrawFacet.sol';
import '../modules/ERC721/interfaces/IERC721ProxyFacet.sol';

interface IDefaultDiamond is
    IERC173,
    IDiamondLoupe,
    IDiamondCut,
    IRegistryProxyFacet,
    IERC20ProxyFacet,
    IERC20DepositFacet,
    IERC20WithdrawFacet,
    IERC20SwapFacet,
    IERC721ProxyFacet
{}
