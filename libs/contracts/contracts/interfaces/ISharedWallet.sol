// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import 'diamond-2/contracts/interfaces/IERC173.sol';
import 'diamond-2/contracts/interfaces/IDiamondLoupe.sol';
import 'diamond-2/contracts/interfaces/IDiamondCut.sol';
import '../modules/SharedWallet/interfaces/ISharedWalletFacet.sol';
import '../modules/AccessControl/interfaces/IAccessControlFacet.sol';

interface ISharedWallet is IERC173, IDiamondLoupe, IDiamondCut, ISharedWalletFacet, IAccessControlFacet {}
