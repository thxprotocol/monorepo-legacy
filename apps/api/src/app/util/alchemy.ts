import { Network, Alchemy } from 'alchemy-sdk';
import { ALCHEMY_API_KEY } from '../config/secrets';

export const alchemy = new Alchemy({
    apiKey: ALCHEMY_API_KEY,
    network: Network.MATIC_MAINNET,
});
