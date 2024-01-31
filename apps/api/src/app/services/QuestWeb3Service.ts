import { WalletDocument } from '../models/Wallet';
import { Web3QuestDocument } from '../models/Web3Quest';
import { Web3QuestClaim } from '../models/Web3QuestClaim';

async function findOne(quest: Web3QuestDocument, wallet?: WalletDocument) {
    const isClaimed = wallet
        ? await Web3QuestClaim.exists({
              questId: quest._id,
              $or: [{ sub: wallet.sub }, { walletId: wallet._id }],
          })
        : false;

    return {
        ...quest.toJSON(),
        amount: quest.amount,
        pointsAvailable: quest.amount,
        contracts: quest.contracts,
        methodName: quest.methodName,
        threshold: quest.threshold,
        isClaimed,
    };
}

function getAmount(quest: Web3QuestDocument) {
    return quest.amount;
}

function getValidationResult() {
    //
}
function isAvailable() {
    //
}

export default { findOne, getAmount, getValidationResult, isAvailable };
