import mongoose from 'mongoose';

export type AccountDocument = mongoose.Document & TAccount;

const accountSchema = new mongoose.Schema(
    {
        username: { type: String, maxLength: 255 },
        active: Boolean,
        isEmailVerified: Boolean,
        firstName: { type: String, maxLength: 255 },
        lastName: { type: String, maxLength: 255 },
        profileImg: String,
        website: { type: String, maxLength: 255 },
        organisation: { type: String, maxLength: 255 },
        plan: Number,
        // email.sparse allows the value to be null and unique if defined
        email: { type: String, unique: true, sparse: true, maxLength: 255 },
        // address.sparse allows the value to be null and unique if defined
        address: { type: String, unique: true, sparse: true },
        variant: Number,
        otpSecret: String,
        acceptTermsPrivacy: Boolean,
        acceptUpdates: Boolean,
        role: String,
        identity: String,
        goal: [String],
    },
    { timestamps: true },
);

export const Account = mongoose.model<AccountDocument>('Account', accountSchema);
