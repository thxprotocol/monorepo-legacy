// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

import '@gnosis.pm/safe-contracts/contracts/accessors/SimulateTxAccessor.sol';
import '@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol';
import '@gnosis.pm/safe-contracts/contracts/handler/DefaultCallbackHandler.sol';
import '@gnosis.pm/safe-contracts/contracts/handler/CompatibilityFallbackHandler.sol';
import '@gnosis.pm/safe-contracts/contracts/libraries/CreateCall.sol';
import '@gnosis.pm/safe-contracts/contracts/libraries/MultiSend.sol';
import '@gnosis.pm/safe-contracts/contracts/libraries/MultiSendCallOnly.sol';
import '@gnosis.pm/safe-contracts/contracts/examples/libraries/SignMessage.sol';
import '@gnosis.pm/safe-contracts/contracts/GnosisSafeL2.sol';
import '@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol';

// Get the compiler to pick up these facets
contract ImportSafe {
    SimulateTxAccessor public simulateTxAccessor;
    GnosisSafeProxyFactory public gnosisSafeProxyFactory;
    DefaultCallbackHandler public defaultCallbackHandler;
    CompatibilityFallbackHandler public compatibilityFallbackHandler;
    CreateCall public createCall;
    MultiSend public multiSend;
    MultiSendCallOnly public multiSendCallOnly;
    SignMessageLib public signMessageLib;
    GnosisSafeL2 public gnosisSafeL2;
    GnosisSafe public gnosisSafe;
}
