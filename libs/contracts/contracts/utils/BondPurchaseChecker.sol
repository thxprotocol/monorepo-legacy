// SPDX-License-Identifier: Apache-2.0
pragma abicoder v2;
pragma solidity ^0.7.6;

interface ICustomBill {
    struct Bill {
        uint256 payout;
        uint256 payoutClaimed;
        uint256 vesting;
        uint256 vestingTerm;
        uint256 vestingStartTimestamp;
        uint256 lastClaimTimestamp;
        uint256 truePricePaid;
    }

    function getBillIds(address user) external view returns (uint[] memory);
    function getBillInfo(uint256 billId) external view returns (Bill memory);
}

contract BondPurchaseChecker {
    ICustomBill bond;

    constructor(address _bondContractAddress) {
        bond = ICustomBill(_bondContractAddress);
    }

    function largestPayoutOf(address _user) public view returns (uint256) {
        uint[] memory billIds = bond.getBillIds(_user);
        uint256 largestPayout = 0;

        for (uint i = 0; i < billIds.length; i++) {
            uint256 payout = bond.getBillInfo(billIds[i]).payout;
            largestPayout = payout > largestPayout ? payout : largestPayout;
        }

        return largestPayout;
    }
}
