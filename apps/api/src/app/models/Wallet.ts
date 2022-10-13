import mongoose from 'mongoose';

export interface TWallet {
    address: string;
    poolId: string;
}

const walletSchema = new mongoose.Schema({
    address: String,
    poolId: String,
});

export default mongoose.model<TWallet>('wallet', walletSchema);
