import mongoose from 'mongoose';

export interface TWallet {
    address: string;
    sub: string;
}

const walletSchema = new mongoose.Schema({
    address: String,
    sub: String,
});

export default mongoose.model<TWallet>('wallet', walletSchema);
