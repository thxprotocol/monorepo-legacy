import mongoose from 'mongoose';

export type WalletManagerDocument = mongoose.Document & TWalletManager;
export interface TWalletManager {
    walletId: string;
    address: string;
}

const walletManagerSchema = new mongoose.Schema({
    walletId: String,
    address: { type: String, unique: true },
});

export default mongoose.model<TWalletManager>('walletManager', walletManagerSchema);
