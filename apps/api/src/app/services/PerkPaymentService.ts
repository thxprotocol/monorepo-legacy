import { ERC721 } from '@thxnetwork/api/models/ERC721';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';
import { ERC721PerkPayment } from '@thxnetwork/api/models/ERC721PerkPayment';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import { ForbiddenError, BadRequestError } from '@thxnetwork/api/util/errors';
import MailService from './MailService';
import { Widget } from './WidgetService';
import { Wallet } from './WalletService';

async function parsePaymentIntent(event) {
    const { id, amount, currency } = event.data.object;
    const isExistingPayment = await ERC721PerkPayment.exists({ 'paymentIntent.id': id });
    if (isExistingPayment) throw new ForbiddenError('This payment has already been processed.');

    const { perk_id, sub } = event.data.object.metadata;
    if (!sub || !perk_id) throw new BadRequestError('Missing sub or perk_id in payment intent metadata.');

    return { id, amount, currency, perk_id, sub };
}

async function onPaymentIntentSucceeded(event) {
    const { id, sub, perk_id, amount, currency } = await parsePaymentIntent(event);
    const account = await AccountProxy.getById(sub);
    const perk = await ERC721Perk.findById(perk_id);
    const erc721 = await ERC721.findById(perk.erc721Id);
    const metadata = await ERC721Metadata.findById(perk.metadataId);
    const pool = await PoolService.getById(perk.poolId);
    const widget = await Widget.findOne({ poolId: pool._id });
    const wallet = await Wallet.findOne({ sub: account.sub, chainId: pool.chainId });

    await ERC721Service.mint(pool, erc721, wallet, metadata);

    await ERC721PerkPayment.create({
        sub,
        perkId: perk_id,
        poolId: perk.poolId,
        amount: 0,
        paymentIntent: { id, amount, currency },
    });

    let html = `<p style="font-size: 18px">Congratulations!🚀</p>`;
    html += `<p>Your payment has been received and <strong>${metadata.name}</strong> dropped into your wallet!</p>`;
    html += `<p class="btn"><a href="${widget.domain}">View Wallet</a></p>`;

    await MailService.send(account.email, `🎁 NFT Drop! ${metadata.name}`, html);
}

export default { onPaymentIntentSucceeded };
