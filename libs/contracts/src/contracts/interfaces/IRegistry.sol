// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import 'diamond-2/contracts/interfaces/IERC173.sol';
import 'diamond-2/contracts/interfaces/IDiamondLoupe.sol';
import 'diamond-2/contracts/interfaces/IDiamondCut.sol';
import '../modules/Registry/interfaces/IRegistryFacet.sol';

interface IRegistry is IERC173, IDiamondLoupe, IDiamondCut, IRegistryFacet {}
