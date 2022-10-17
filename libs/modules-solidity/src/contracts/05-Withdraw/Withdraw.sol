// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Withdraw Proposal
* @author Evert Kors <evert@thx.network>
* @notice Create and propose withdrawals.
* 
* Implementations: 
* TMP-7 Withdrawals: https://github.com/thxprotocol/modules/issues/7
* 
* Dependencies:
* TMP-6 Base Poll: https://github.com/thxprotocol/modules/issues/6
* TMP-2 Member Control: https://github.com/thxprotocol/modules/issues/2
/******************************************************************************/

import '@openzeppelin/contracts/utils/EnumerableSet.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';

// Implements
import '../TMP/TMP7/IWithdraw.sol';
import '../TMP/TMP7/LibWithdrawPollStorage.sol';

// Depends on
import '../TMP/TMP6/LibBasePollStorage.sol';
import '../TMP/TMP2/LibMemberAccessStorage.sol';
import '../util/Access.sol'; // TMP 1

contract Withdraw is Access, IWithdraw {
    /**
     * @notice Proposes a withdraw poll with the default withdrawPollDuration.
     * @param _amount Size of the proposed withdrawal.
     * @param _beneficiary Beneficiary of the reward.
     */
    function proposeWithdraw(uint256 _amount, address _beneficiary) external override onlyOwner {
        require(_amount != 0, 'NOT_VALID');

        _createWithdrawPoll(
            _amount,
            LibWithdrawPollStorage.withdrawStorage().proposeWithdrawPollDuration,
            _beneficiary
        );
    }

    /**
     * @notice Proposes a withdraw poll with the default withdrawPollDuration in bulk.
     * @param _amounts Sizes of the proposed withdrawal.
     * @param _beneficiaries Beneficiaries of the reward.
     */
    function proposeBulkWithdraw(uint256[] memory _amounts, address[] memory _beneficiaries)
        external
        override
        onlyOwner
    {
        require(_amounts.length != 0, 'INVALID_INPUT');
        require(_beneficiaries.length != 0, 'INVALID_INPUT');
        require(_amounts.length == _beneficiaries.length, 'INVALID_INPUT');

        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            require(_amounts[i] != 0, 'NOT_VALID');
            require(_beneficiaries[i] != address(0), 'NOT_VALID');
            _createWithdrawPoll(
                _amounts[i],
                LibWithdrawPollStorage.withdrawStorage().proposeWithdrawPollDuration,
                _beneficiaries[i]
            );
        }
    }

    /**
     * @notice Starts a withdraw poll.
     * @param _amount Size of the withdrawal.
     * @param _duration The duration the withdraw poll.
     * @param _beneficiary Beneficiary of the reward.
     */
    function _createWithdrawPoll(
        uint256 _amount,
        uint256 _duration,
        address _beneficiary
    ) internal returns (uint256) {
        LibBasePollStorage.BaseStorage storage bst = LibBasePollStorage.baseStorage();
        bst.pollCounter = bst.pollCounter + 1;

        LibBasePollStorage.BasePollStorage storage baseStorage = LibBasePollStorage.basePollStorageId(bst.pollCounter);
        baseStorage.id = bst.pollCounter;
        baseStorage.startTime = block.timestamp;
        baseStorage.endTime = block.timestamp + _duration;

        LibWithdrawPollStorage.WithdrawPollStorage storage wpStorage =
            LibWithdrawPollStorage.withdrawPollStorageId(bst.pollCounter);

        LibMemberAccessStorage.MemberStorage storage ms = LibMemberAccessStorage.memberStorage();
        if (!_hasRole(MEMBER_ROLE, _beneficiary)) {
            ms.memberCounter += 1;
            ms.addressToMember[_beneficiary] = ms.memberCounter;
            ms.memberToAddress[ms.memberCounter] = _beneficiary;
            _grantRole(MEMBER_ROLE, _beneficiary);
        }

        wpStorage.beneficiary = ms.addressToMember[_beneficiary];
        wpStorage.amount = _amount;

        emit WithdrawPollCreated(bst.pollCounter, wpStorage.beneficiary);
    }

    /**
     * @param _duration Default duration of the poll for proposed withdrawals.
     */
    function setProposeWithdrawPollDuration(uint256 _duration) external override onlyManager {
        LibWithdrawPollStorage.withdrawStorage().proposeWithdrawPollDuration = _duration;
    }

    /**
     * @return default duration in seconds for polls for proposed withdrawals.
     */
    function getProposeWithdrawPollDuration() external view override returns (uint256) {
        return LibWithdrawPollStorage.withdrawStorage().proposeWithdrawPollDuration;
    }
}
