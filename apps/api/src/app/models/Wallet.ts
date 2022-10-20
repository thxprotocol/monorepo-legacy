import mongoose from 'mongoose';
import { ChainId } from '../types/enums';

export interface TWallet {
    address: string;
    sub: string;
    chainId: ChainId;
}

const walletSchema = new mongoose.Schema({
    address: String,
    sub: String,
    chainId: Number,
});

export default mongoose.model<TWallet>('wallet', walletSchema);
