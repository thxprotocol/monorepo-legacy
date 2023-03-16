import { ChainId } from '@thxnetwork/types/enums';
import mongoose from 'mongoose';

export type TMembership = {
    sub: string;
    isRemoved?: boolean;
    chainId?: ChainId;
    poolId: string;
    erc20Id: string;
    erc721Id: string;
    erc20?: string;
    erc721?: string;
};
export type MembershipDocument = mongoose.Document & TMembership;

const membershipSchema = new mongoose.Schema(
    {
        sub: String,
        poolId: String,
        erc20Id: String,
        erc721Id: String,
    },
    { timestamps: true },
);

export const Membership = mongoose.model<MembershipDocument>('Membership', membershipSchema, 'membership');
