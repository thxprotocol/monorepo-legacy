// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Reward Distribution
* @author Evert Kors <evert@thx.network>
* @notice Configure reward distribution.
* 
* Implementations: 
* TMP-8 Rewards: https://github.com/thxprotocol/modules/issues/7
* 
* Dependencies:
* TMP-1 Access Control: https://github.com/thxprotocol/modules/issues/1
* TMP-2 Member ID: https://github.com/thxprotocol/modules/issues/2
* TMP-6 Base Poll: https://github.com/thxprotocol/modules/issues/6
* TMP-7 Withdrawal: https://github.com/thxprotocol/modules/issues/6
/******************************************************************************/

// Implements
import '../TMP/TMP8/IReward.sol';
import '../TMP/TMP8/LibRewardPollStorage.sol';

// Depends on
import '../util/Access.sol'; // TMP 1
import '../TMP/TMP2/LibMemberAccessStorage.sol';
import '../TMP/TMP7/LibWithdrawPollStorage.sol';
import '../TMP/TMP7/IWithdrawEvents.sol';
import '../util/BasePoll.sol'; // TMP1, TMP 6
import '../TMP/TMP6/LibBasePollStorage.sol';

contract Reward is Access, IReward, IWithdrawEvents {
    /**
     * @param _duration The duration of the reward poll
     */
    function setRewardPollDuration(uint256 _duration) external override onlyManager {
        LibRewardPollStorage.rewardStorage().rewardPollDuration = _duration;
    }

    /**
     * @return the default reward poll duration
     */
    function getRewardPollDuration() external view override returns (uint256) {
        return LibRewardPollStorage.rewardStorage().rewardPollDuration;
    }

    /**
     * @param _id The ID of the reward
     * @return the reward information
     */
    function getReward(uint256 _id) external view override returns (LibRewardPollStorage.Reward memory) {
        return LibRewardPollStorage.rewardStorage().rewards[_id - 1];
    }

    /**
     * @dev Claim a reward for another member
     * @param _withdrawAmount The  amount to withdraw for this reward.
     * @param _withdrawDuration The duration of the withdraw poll for this reward.
     */
    function addReward(uint256 _withdrawAmount, uint256 _withdrawDuration) external override onlyOwner {
        require(_withdrawAmount != 0, 'NOT_VALID');
        LibRewardPollStorage.Reward memory reward;

        reward.id = LibRewardPollStorage.rewardStorage().rewards.length + 1;
        reward.state = LibRewardPollStorage.RewardState.Disabled;
        reward.pollId = _createRewardPoll(reward.id, _withdrawAmount, _withdrawDuration);
        LibRewardPollStorage.rewardStorage().rewards.push(reward);
    }

    /**
     * @dev Claim a reward for another member
     * @param _id The ID of the reward to claim.
     * @param _withdrawAmount The new amount to withdraw for this reward.
     * @param _withdrawDuration The new duration of the withdraw poll for this reward.
     */
    function updateReward(
        uint256 _id,
        uint256 _withdrawAmount,
        uint256 _withdrawDuration
    ) external override onlyOwner {
        // todo verify amount
        require(_isMember(_msgSender()), 'NOT_MEMBER');
        LibRewardPollStorage.Reward storage reward = LibRewardPollStorage.rewardStorage().rewards[_id - 1];

        // storage will be deleted (e.g. set to default) after poll is finalized
        require(reward.pollId == 0, 'IS_NOT_FINALIZED');
        // setting both params to initial state is not allowed
        // this is a reserverd state for new rewards
        require(!(_withdrawAmount == 0 && _withdrawDuration == 0), 'NOT_ALLOWED');

        require(
            !(reward.withdrawAmount == _withdrawAmount && reward.withdrawDuration == _withdrawDuration),
            'IS_EQUAL'
        );

        reward.pollId = _createRewardPoll(_id, _withdrawAmount, _withdrawDuration);
    }

    /**
     * @dev Enable an existing reward, should be disabled and can only be called by managers.
     * @param _id The ID of the reward to claim.
     */
    function enableReward(uint256 _id) external override onlyOwner {
        require(_isManager(_msgSender()), 'NOT_MANAGER');

        LibRewardPollStorage.Reward storage reward = LibRewardPollStorage.rewardStorage().rewards[_id - 1];
        require(reward.state != LibRewardPollStorage.RewardState.Enabled, 'ALREADY_ENABLED');

        reward.state = LibRewardPollStorage.RewardState.Enabled;
    }

    /**
     * @dev Disable an existing reward, should be enabled and can only be called by managers.
     * @param _id The ID of the reward to claim.
     */
    function disableReward(uint256 _id) external override onlyOwner {
        require(_isManager(_msgSender()), 'NOT_MANAGER');

        LibRewardPollStorage.Reward storage reward = LibRewardPollStorage.rewardStorage().rewards[_id - 1];
        require(reward.state != LibRewardPollStorage.RewardState.Disabled, 'ALREADY_DISABLED');

        reward.state = LibRewardPollStorage.RewardState.Disabled;
    }

    /**
     * @notice Claim a reward for another member
     * @param _id The ID of the reward to claim for the other member
     */
    function claimRewardFor(uint256 _id, address _beneficiary) public override {
        require(_isMember(_msgSender()), 'NOT_MEMBER');
        require(_isMember(_beneficiary), 'NOT_MEMBER');

        LibRewardPollStorage.Reward memory current = LibRewardPollStorage.rewardStorage().rewards[_id - 1];

        require(current.state == LibRewardPollStorage.RewardState.Enabled, 'IS_NOT_ENABLED');
        _createWithdrawPoll(current.withdrawAmount, current.withdrawDuration, _beneficiary);
    }

    /**
     * @notice Claim a reward
     * @param _id The ID of the reward to claim
     */
    function claimReward(uint256 _id) external override {
        claimRewardFor(_id, _msgSender());
    }

    /**
     * @dev Starts a withdraw poll.
     * @param _amount Size of the withdrawal
     * @param _duration The duration the withdraw poll
     * @param _beneficiary Beneficiary of the reward
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

        wpStorage.amount = _amount;
        wpStorage.beneficiary = LibMemberAccessStorage.memberStorage().addressToMember[_beneficiary];

        emit WithdrawPollCreated(bst.pollCounter, wpStorage.beneficiary);
        return baseStorage.id;
    }

    /**
     * @dev Starts a withdraw poll.
     * @param _id The ID of the reward
     * @param _withdrawAmount The amount the beneficiary may withdraw
     * @param _withdrawDuration The duration of the withdraw poll
     */
    function _createRewardPoll(
        uint256 _id,
        uint256 _withdrawAmount,
        uint256 _withdrawDuration
    ) internal returns (uint256) {
        LibBasePollStorage.BaseStorage storage bst = LibBasePollStorage.baseStorage();
        bst.pollCounter = bst.pollCounter + 1;

        LibBasePollStorage.BasePollStorage storage baseStorage = LibBasePollStorage.basePollStorageId(bst.pollCounter);

        LibRewardPollStorage.RewardStorage storage rewardStorage = LibRewardPollStorage.rewardStorage();

        LibRewardPollStorage.RewardPollStorage storage rpStorage =
            LibRewardPollStorage.rewardPollStorageId(bst.pollCounter);

        baseStorage.id = bst.pollCounter;
        baseStorage.startTime = block.timestamp;
        baseStorage.endTime = block.timestamp + rewardStorage.rewardPollDuration;

        rpStorage.rewardIndex = _id - 1;
        rpStorage.withdrawAmount = _withdrawAmount;
        rpStorage.withdrawDuration = _withdrawDuration;

        emit RewardPollCreated(bst.pollCounter, _msgSender(), _id, _withdrawAmount);
        return baseStorage.id;
    }
}
