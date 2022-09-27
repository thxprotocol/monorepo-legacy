import bcrypt from 'bcrypt-nodejs';
import mongoose from 'mongoose';
import { TAccount } from '../types/TAccount';
import { encryptString } from '../util/encrypt';

export type AccountDocument = mongoose.Document & TAccount;

const accountSchema = new mongoose.Schema(
    {
        active: Boolean,
        firstName: String,
        lastName: String,
        profileImg: String,
        organisation: String,
        plan: Number,
        // email.sparse allows the value to be null and unique if defined
        email: { type: String, unique: true, sparse: true },
        password: String,
        // address.sparse allows the value to be null and unique if defined
        address: { type: String, unique: true, sparse: true },
        variant: Number,
        privateKey: String,
        signupToken: String,
        otpSecret: String,
        signupTokenExpires: Date,
        authenticationToken: String,
        authenticationTokenExpires: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        googleAccessToken: String,
        googleRefreshToken: String,
        googleAccessTokenExpires: Number,
        twitterAccessToken: String,
        twitterRefreshToken: String,
        twitterAccessTokenExpires: Number,
        spotifyAccessToken: String,
        spotifyRefreshToken: String,
        spotifyAccessTokenExpires: Number,
        acceptTermsPrivacy: Boolean,
        acceptUpdates: Boolean,
        lastLoginAt: Date,
    },
    { timestamps: true },
);

/**
 * Password hash middleware.
 */
accountSchema.pre('save', function save(next) {
    const account = (this as any) as AccountDocument;

    if (!account.isModified('password')) {
        return next();
    }

    if (account.privateKey) {
        account.privateKey = encryptString(account.privateKey, account.password);
    }

    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt.hash(account.password, salt, undefined, (err: mongoose.Error, hash) => {
            if (err) {
                return next(err);
            }
            account.password = hash;
            next();
        });
    });
});

const comparePassword = function (candidatePassword: string) {
    return bcrypt.compareSync(candidatePassword, this.password);
};

accountSchema.methods.comparePassword = comparePassword;

export const Account = mongoose.model<AccountDocument>('Account', accountSchema);
