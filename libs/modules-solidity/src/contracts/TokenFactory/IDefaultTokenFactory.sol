// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

import 'diamond-2/contracts/interfaces/IERC173.sol';
import 'diamond-2/contracts/interfaces/IDiamondLoupe.sol';
import 'diamond-2/contracts/interfaces/IDiamondCut.sol';
import './ITokenFactory.sol';

interface IDefaultTokenFactory is IERC173, IDiamondLoupe, IDiamondCut, ITokenFactory {}
