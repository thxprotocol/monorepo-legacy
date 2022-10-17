// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

interface IRelayHub {
    event Result(bool success, bytes data);

    function getLatestNonce(address _signer) external view returns (uint256);

    function call(
        bytes calldata _call,
        uint256 _nonce,
        bytes memory _sig
    ) external;
}
