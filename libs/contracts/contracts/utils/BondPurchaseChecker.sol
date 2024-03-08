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
    struct Bill {
        uint256 payout;
        uint256 payoutClaimed;
        uint256 vesting;
        uint256 vestingTerm;
        uint256 vestingStartTimestamp;
        uint256 lastClaimTimestamp;
        uint256 truePricePaid;
    }

    ICustomBill bond;

    constructor(address _bondContractAddress) {
        bond = ICustomBill(_bondContractAddress);
    }

    function largestTruePricePaidOf(address _user) public view returns (uint256) { 
        require(_user != address(0), "!user");

        uint[] memory billIds = bond.getBillIds(_user);
        uint256 largestTruePricePaid = 0;

        for (uint i = 0; i < billIds.length; i++) {
            uint256 currentTruePricePaid = bond.getBillInfo(billIds[i]).truePricePaid;
            largestTruePricePaid = currentTruePricePaid > largestTruePricePaid ? currentTruePricePaid : largestTruePricePaid;
        }

        return largestTruePricePaid;
    }
}