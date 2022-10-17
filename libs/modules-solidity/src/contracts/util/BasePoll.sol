// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

import '@openzeppelin/contracts/math/SafeMath.sol';

import '../TMP/TMP6/LibBasePollStorage.sol';
import './Access.sol'; // TMP 1

abstract contract BasePoll is Access {
    using SafeMath for uint256;

    modifier isSelf {
        require(msg.sender == address(this));
        _;
    }

    function onPollFinish(uint256 _id) internal virtual;

    function voteValidate(address _voter) internal virtual;

    modifier checkTime() {
        LibBasePollStorage.BasePollStorage storage bData = baseData();
        require(block.timestamp >= bData.startTime && block.timestamp <= bData.endTime, 'IS_NO_VALID_TIME');
        _;
    }

    /**
     * @notice Finalize poll and call onPollFinish callback with result
     */
    function finalize() internal {
        LibBasePollStorage.BasePollStorage storage bData = baseData();
        require(block.timestamp >= bData.endTime, 'WRONG_STATE');
        onPollFinish(bData.id);
        delete bData.id;
        delete bData.startTime;
        delete bData.endTime;
        delete bData.yesCounter;
        delete bData.noCounter;
        delete bData.totalVoted;
        //delete bData.votesByAddress;
    }

    /**
     * @dev callback called after poll finalization
     * @param _agree True if user endorses the proposal else False
     */
    function vote(bool _agree) internal checkTime {
        voteValidate(_msgSender());
        LibBasePollStorage.BasePollStorage storage bData = baseData();

        require(bData.votesByAddress[_msgSender()].time == 0, 'HAS_VOTED');
        uint256 voiceWeight = 1;

        if (_agree) {
            bData.yesCounter = bData.yesCounter.add(voiceWeight);
        } else {
            bData.noCounter = bData.noCounter.add(voiceWeight);
        }

        bData.votesByAddress[_msgSender()].time = block.timestamp;
        bData.votesByAddress[_msgSender()].weight = voiceWeight;
        bData.votesByAddress[_msgSender()].agree = _agree;

        bData.totalVoted = bData.totalVoted.add(1);
    }

    /**
     * @notice Revoke user`s vote
     */
    function revokeVote() internal checkTime {
        LibBasePollStorage.BasePollStorage storage bData = baseData();
        address _voter = _msgSender();

        require(bData.votesByAddress[_voter].time > 0, 'HAS_NOT_VOTED');

        uint256 voiceWeight = bData.votesByAddress[_voter].weight;
        bool agree = bData.votesByAddress[_voter].agree;

        bData.votesByAddress[_voter].time = 0;
        bData.votesByAddress[_voter].weight = 0;
        bData.votesByAddress[_voter].agree = false;

        bData.totalVoted = bData.totalVoted.sub(1);
        if (agree) {
            bData.yesCounter = bData.yesCounter.sub(voiceWeight);
        } else {
            bData.noCounter = bData.noCounter.sub(voiceWeight);
        }
    }

    function baseData() internal pure returns (LibBasePollStorage.BasePollStorage storage) {
        return LibBasePollStorage.basePollStorage(bps());
    }

    /**
     * @dev This function gets the poll ID of message data that is appended with an address
     */
    function bps() internal pure returns (bytes32 rt) {
        // These fields are not accessible from assembly
        bytes memory array = msg.data;
        // minus address space
        uint256 index = msg.data.length - 20;

        // solhint-disable-next-line no-inline-assembly
        assembly {
            rt := mload(add(array, index))
        }
    }
}
