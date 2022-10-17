// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Reward Poll
* @author Evert Kors <evert@thx.network>
* @notice Extends base polls with reward information.
* 
* Implementations:
* TMP-6 Base poll: https://github.com/thxprotocol/modules/issues/6
* TMP-8 Rewards: https://github.com/thxprotocol/modules/issues/8
/******************************************************************************/

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/EnumerableSet.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';

// Implements
import '../util/BasePoll.sol'; // TMP1, TMP 6
import '../TMP/TMP6/LibBasePollStorage.sol';
import '../TMP/TMP8/IRewardPoll.sol';
import '../TMP/TMP8/LibRewardPollStorage.sol';

contract RewardPoll is BasePoll, IRewardPoll {
    uint256 constant ENABLE_REWARD = 2**250;
    uint256 constant DISABLE_REWARD = 2**251;

    modifier isReward {
        LibBasePollStorage.BasePollStorage storage bData = baseData();

        LibRewardPollStorage.RewardPollStorage storage rwPollData = LibRewardPollStorage.rewardPollStorageId(bData.id);

        require(rwPollData.withdrawAmount != 0, 'NOT_REWARD_POLL');
        _;
    }

    function voteValidate(address _voter) internal view override {
        require(_isMember(_voter), 'NO_MEMBER');
    }

    /**
     * @dev callback called after poll finalization
     * @param _id ID of the reward poll
     */
    function onPollFinish(uint256 _id) internal override {
        LibRewardPollStorage.RewardPollStorage storage rwPollData = LibRewardPollStorage.rewardPollStorageId(_id);

        LibRewardPollStorage.Reward storage reward =
            LibRewardPollStorage.rewardStorage().rewards[rwPollData.rewardIndex];

        bool approved = _rewardPollApprovalState();
        if (approved) {
            if (rwPollData.withdrawAmount == ENABLE_REWARD) {
                reward.state = LibRewardPollStorage.RewardState.Enabled;
                emit RewardPollEnabled(_id);
            } else if (rwPollData.withdrawAmount == DISABLE_REWARD) {
                reward.state = LibRewardPollStorage.RewardState.Disabled;
                emit RewardPollDisabled(_id);
            } else {
                // initial state
                if (reward.withdrawAmount == 0 && reward.withdrawDuration == 0) {
                    reward.state = LibRewardPollStorage.RewardState.Enabled;
                    emit RewardPollEnabled(_id);
                }
                reward.withdrawAmount = rwPollData.withdrawAmount;
                reward.withdrawDuration = rwPollData.withdrawDuration;
                emit RewardPollUpdated(_id, reward.withdrawAmount, reward.withdrawDuration);
            }
        }
        emit RewardPollFinalized(_id, approved);
        delete reward.pollId;
        delete rwPollData.withdrawAmount;
        delete rwPollData.withdrawDuration;
    }

    /**
     * @param _id ID of the reward
     * @return The amound a member can withdraw for this reward.
     */
    function getWithdrawAmount(uint256 _id) external view override returns (uint256) {
        return LibRewardPollStorage.rewardPollStorageId(_id).withdrawAmount;
    }

    /**
     * @param _id ID of the reward
     * @return The duration of the optional withdraw poll for this reward.
     */
    function getWithdrawDuration(uint256 _id) external view override returns (uint256) {
        return LibRewardPollStorage.rewardPollStorageId(_id).withdrawDuration;
    }

    /**
     * @param _id ID of the reward
     * @return The storage index of the reward.
     */
    function getRewardIndex(uint256 _id) external view override returns (uint256) {
        return LibRewardPollStorage.rewardPollStorageId(_id).rewardIndex;
    }

    /**
     * @param _agree Bool reflecting vote for the poll
     * @dev calls generic vote() function and emits reward poll specific event.
     */
    function _rewardPollVote(bool _agree) external override isReward isSelf {
        vote(_agree);
        emit RewardPollVoted(baseData().id, _msgSender(), _agree);
    }

    /**
     * @dev calls abstract revokeVote() function and emits reward poll specific event.
     */
    function _rewardPollRevokeVote() external override isReward isSelf {
        revokeVote();
        emit RewardPollRevokedVote(baseData().id, _msgSender());
    }

    function _rewardPollFinalize() external override isReward isSelf {
        finalize();
    }

    function _rewardPollApprovalState() public view virtual override isReward isSelf returns (bool) {
        LibBasePollStorage.BasePollStorage storage bData = baseData();
        return bData.yesCounter > bData.noCounter;
    }
}
