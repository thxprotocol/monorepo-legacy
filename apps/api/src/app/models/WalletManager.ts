import mongoose from 'mongoose';

export interface TWalletManager {
    walletId: string;
    address: string;
}

const walletManagerSchema = new mongoose.Schema({
    walletId: String,
    address: { type: String, unique: true },
});

export default mongoose.model<TWalletManager>('walletManager', walletManagerSchema);
