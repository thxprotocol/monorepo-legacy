import { Account, AccountDocument } from '../models/Account';
import { AccountVariant, AccountPlanType } from '@thxnetwork/common/enums';
import { generateUsername } from 'unique-username-generator';
import { toChecksumAddress } from 'web3-utils';
import { BadRequestError } from '../util/errors';
import { MailService } from './MailService';
import { WIDGET_URL } from '../config/secrets';
import { accountVariantProviderMap } from '@thxnetwork/common/maps';
import TokenService from './TokenService';

export class AccountService {
    static create(data: Partial<AccountDocument>) {
        return Account.create({
            plan: AccountPlanType.Lite,
            username: generateUsername(),
            ...data,
            email: data.email && data.email.toLowerCase(),
            isEmailVerified: false,
            active: true,
        });
    }

    static async update(account: AccountDocument, data: Partial<AccountDocument & { returnUrl?: string }>) {
        // Checksum address
        if (data.address) {
            data.address = toChecksumAddress(data.address);
        }

        // Test username when changing username
        if (data.username && account.username !== data.username) {
            const isUsed = await Account.exists({
                username: data.username,
                _id: { $ne: data._id, $exists: true },
            });
            if (isUsed) throw new BadRequestError('Username already in use.');
        }

        // Send verification email when changing email
        if (data.email) {
            // Only check if email is different than the current one
            if (data.email !== account.email) {
                const isUsed = await Account.exists({
                    email: data.email,
                    _id: { $ne: String(account._id), $exists: true },
                });
                if (isUsed) throw new BadRequestError('Email already in use.');
                data.isEmailVerified = false;
            }

            // Always send mail in case this is a retry
            await MailService.sendVerificationEmail(account, data.email, WIDGET_URL);
        }

        return await Account.findByIdAndUpdate(account._id, data, { new: true });
    }

    static get(sub: string) {
        return Account.findById(sub);
    }

    static find(query: { _id: string[] }) {
        return Account.find({ _id: { $in: query._id } });
    }

    static findByQuery({ query }: { query: string }) {
        return Account.find({ $or: [{ username: new RegExp(query, 'i') }, { email: new RegExp(query, 'i') }] });
    }

    static getByEmail(email: string) {
        return Account.findOne({ email });
    }

    static getByIdentity(identity: string) {
        return Account.findOne({ identity });
    }

    static getByAddress(address: string) {
        return Account.findOne({ address });
    }

    static async remove(id: string) {
        await Account.deleteOne({ _id: id });
    }

    static findAccountForSession(session: { accountId: string }) {
        return Account.findById(session.accountId);
    }

    static findAccountForEmail(email: string) {
        return Account.findOne({ email: email.toLowerCase() });
    }

    static async findAccountForToken(variant: AccountVariant, tokenInfo: Partial<{ userId: string }>) {
        const kind = accountVariantProviderMap[variant];
        const token = await TokenService.findTokenForUserId(tokenInfo.userId, kind);
        if (!token) return;

        return await Account.findById(token.sub);
    }

    static async findAccountForAddress(address: string) {
        const checksummedAddress = toChecksumAddress(address);
        // Checking for non checksummed as well in order to avoid issues with existing data in db
        const account = await Account.findOne({
            $or: [{ address: checksummedAddress }, { address }],
            variant: AccountVariant.Metamask,
        });
        if (account) return account;
        return await Account.create({
            variant: AccountVariant.Metamask,
            plan: AccountPlanType.Lite,
            address,
        });
    }
}
