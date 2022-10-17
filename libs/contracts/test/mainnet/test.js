// const { expect, assert } = require("chai");
// const { parseEther } = require("ethers/lib/utils");
// const { networks } = require("../../hardhat.config.js");
// const {
//   getSelectors,
//   diamond,
//   assetPool,
//   MEMBER_ROLE,
//   MANAGER_ROLE,
//   ADMIN_ROLE,
// } = require("../utils.js");
// const { utils } = require("ethers/lib");
// const { network } = require("hardhat");

// contracts = {
//   goerli: {
//     AccessControl: "0xc25f17c53E6ef5dA94A86D1355AC9D9e8981A201",
//     MemberAccess: "0x09FF0628e1cC53819486D5ef82D3284Df0C35602",
//     Token: "0x8aeF16AE91114F40e67B83D508b60313E0Ed65B0",
//     BasePollProxy: "0x45981F165E56644D68d02D4cEEDc9e215a4B3f8F",
//     Withdraw: "0x40A435640D8E4c77b66f802f939e5604d6EeF714",
//     WithdrawPoll: "0x54b629816f37967806490b63914A21f43E33C217",
//     WithdrawPollProxy: "0x24Ab443E5e0188e9fCA6f3D5f02d6E1e49aBd173",
//     Reward: "0x062E05437961F6E7ad5bf541Dec3d3910c663850",
//     RewardPoll: "0xfBD81624DE76468Ef939F178e27cF629424BeB8E",
//     RewardPollProxy: "0x6F5149d0895929635eFcD6d014Ed70A7969b0a34",
//     DiamondCutFacet: "0x8D13C1B01042ab1755f7af5eFD4Dbd75C09A68c6",
//     DiamondLoupeFacet: "0xEd67775b25172A1F6Be4fbECad2fce2BCaCA2517",
//     OwnershipFacet: "0xc15C08ff98A2edfD227d1AbFB2FDcd27725119BB",
//     UpdateDiamondFacet: "0x65dA75C66bd7bC8C0B2AECE3981B47504e8a995E",

//     WithdrawBy: "0x1b280D1C8AeB6e0e742586c3F644d54251dcC9b9",
//     WithdrawByPoll: "0xbc28306b668e5D15bAD620E0d9790c536E98d4be",
//     WithdrawByPollProxy: "0x341f769Ec6eD6E68e1e2A2e86fC367a4b05ac97B",
//     RewardBy: "0xFBbCF7466aa43755d03dcB5D67565Eb4f3f7af94",
//     RewardByPoll: "0x35A71438B98278899E0DE2E560D1e506Df8A2aA1",
//     RewardByPollProxy: "0xC886c1bD8C22b4eD26A385eEfa4b54E53E280BDF",

//     RelayDiamond1: "0x71BF91990924643d9FDbcca42941d795Df4B882E",
//     RelayDiamond2: "0xfcb0c875DF8ac37d46C26C047ff79A8b5c41F313",
//   },
// };

// describe("Mainnet test", function () {
//   let owner;
//   let voter;
//   let diamond;
//   let diamond2;
//   let WithdrawByPoll;

//   before(async function () {
//     [owner] = await ethers.getSigners();
//     if (network.name !== "fork") {
//       throw Error("Unexpected network");
//     }
//     diamond = await ethers.getContractAt(
//       "IDefaultDiamond",
//       contracts.goerli.RelayDiamond1
//     );
//     diamond2 = await ethers.getContractAt(
//       "IDefaultDiamond",
//       contracts.goerli.RelayDiamond2
//     );
//     WithdrawByPoll = await ethers.getContractAt(
//       "WithdrawByPoll",
//       contracts.goerli.WithdrawByPoll
//     );
//     await diamond.initializeRoles(await owner.getAddress());
//     await diamond2.initializeRoles(await owner.getAddress());
//   });
//   it("test duration", async function () {
//     expect(await diamond.getProposeWithdrawPollDuration()).to.eq(0);
//     await diamond.setProposeWithdrawPollDuration(100);
//     expect(await diamond.getProposeWithdrawPollDuration()).to.eq(100);
//   });
//   it("test duration2", async function () {
//     expect(await diamond2.getProposeWithdrawPollDuration()).to.eq(0);
//     await diamond2.setProposeWithdrawPollDuration(180);
//     expect(await diamond2.getProposeWithdrawPollDuration()).to.eq(180);
//   });
//   it("create vote", async function () {
//     expect(
//       await diamond.proposeWithdraw(parseEther("1"), await owner.getAddress())
//     );
//     expect(await diamond.getAmount(1)).to.eq(parseEther("1"));
//     expect(await diamond.withdrawPollVote(1, true));
//     const vote = await diamond.getVoteByAddress(1, await owner.getAddress());
//     expect(vote.weight).to.eq(1);
//     expect(vote.agree).to.eq(true);
//   });
//   it("swap facet", async function () {
//     await diamond.updateAssetPool(
//       getSelectors(WithdrawByPoll),
//       contracts.goerli.WithdrawByPoll
//     );
//   });
//   it("assert values", async function () {
//     // expect(
//     //   await diamond.proposeWithdraw(parseEther("1"), await owner.getAddress())
//     // );
//     expect(await diamond.getAmount(1)).to.eq(parseEther("1"));
//     //expect(await diamond.withdrawPollVote(1, true));
//     const vote = await diamond.getVoteByAddress(1, await owner.getAddress());
//     expect(vote.weight).to.eq(1);
//     expect(vote.agree).to.eq(true);
//   });
//   // todo poll maken
//   // vote
//   // swap
// });
