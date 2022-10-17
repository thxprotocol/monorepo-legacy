// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

/******************************************************************************\
* @title RelayHub
* @author Evert Kors <evert@thx.network>
* @notice Manage gas costs for relayed contract calls.
* 
* Implementations:
* TMP-9 Gas Station: https://github.com/thxprotocol/modules/issues/9
/******************************************************************************/

import '@openzeppelin/contracts/cryptography/ECDSA.sol';
import '../TMP/TMP9/LibRelayHubStorage.sol';
import '../TMP/TMP9/IRelayHub.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';

contract RelayHubFacet is IRelayHub {
    /**
     * @dev Get the latest nonce of a given signer
     * @param _signer Address of the signer
     */
    function getLatestNonce(address _signer) external view override returns (uint256) {
        return LibRelayHubStorage.rhStorage().signerNonce[_signer];
    }

    /**
     * @dev Validate a given nonce, reverts if nonce is not right
     * @param _signer Address of the signer
     * @param _nonce Nonce of the signer
     */
    function validateNonce(address _signer, uint256 _nonce) private {
        LibRelayHubStorage.RHStorage storage s = LibRelayHubStorage.rhStorage();

        require(s.signerNonce[_signer] + 1 == _nonce, 'INVALID_NONCE');
        s.signerNonce[_signer] = _nonce;
    }

    // Multinonce? https://github.com/PISAresearch/metamask-comp#multinonce
    /**
     * @param _call Encoded function + arguments data
     * @param _nonce Latest nonce for the original sender
     * @param _sig Signed message
     */
    function call(
        bytes memory _call,
        uint256 _nonce,
        bytes memory _sig
    ) external override {
        bytes32 message = ECDSA.toEthSignedMessageHash(keccak256(abi.encodePacked(_call, _nonce)));
        address signer = ECDSA.recover(message, _sig);

        validateNonce(signer, _nonce);
        (bool success, bytes memory returnData) = address(this).call(abi.encodePacked(_call, signer));
        emit Result(success, returnData);
    }
}
