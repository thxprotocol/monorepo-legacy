import { Promotion, PromotionDocument } from '@thxnetwork/api/models/Promotion';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { Deposit } from '@thxnetwork/api/models/Deposit';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { DepositState } from '@thxnetwork/api/types/enums/DepositState';
import { TPromotion } from '@thxnetwork/api/types/TPromotion';
import { Payment } from '@thxnetwork/api/models/Payment';
import { PaymentState } from '@thxnetwork/api/types/enums/PaymentState';

async function create(data: TPromotion) {
    return Promotion.create(data);
}

async function deleteById(id: string, sub: string) {
    const promoCode = await findById(id);

    if (promoCode.sub !== sub) {
        throw new ForbiddenError();
    }

    return promoCode.remove();
}

function findById(id: string) {
    return Promotion.findById(id);
}

async function formatResult(sub: string, promotion: PromotionDocument) {
    // Check if user is owner
    const isOwner = promotion.sub === sub;
    // Check if user made a payment or a deposit
    const deposit = await Deposit.findOne({ sub, item: promotion.id, state: DepositState.Completed });
    const payment = await Payment.findOne({ sub, promotionId: promotion.id, state: PaymentState.Completed });
    const value = isOwner || payment || deposit ? promotion.value : '';

    return {
        _id: String(promotion._id),
        id: String(promotion._id), // TODO Deprecate this when tests are aligned
        title: promotion.title,
        description: promotion.description,
        price: promotion.price,
        value,
    };
}

// page 1 and limit 10 are the default pagination start settings
function findByQuery(query: { poolId: string }, page = 1, limit = 10) {
    return paginatedResults(Promotion, page, limit, query);
}

export default { create, deleteById, findById, findByQuery, formatResult };
