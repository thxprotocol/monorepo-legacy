import mongoose from 'mongoose';

export interface TWalletManager {
    walletId: string;
    address: string;
}

const walletManagerSchema = new mongoose.Schema({
    walletId: String,
    address: String,
});

export default mongoose.model<TWalletManager>('walletManager', walletManagerSchema);
