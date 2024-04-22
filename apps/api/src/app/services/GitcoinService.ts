import axios from 'axios';
import { GITCOIN_API_KEY } from '../config/secrets';
import { logger } from '../util/logger';
export default class GitcoinService {
    static async submitPassport(scorerId: number, address: string) {
        await axios({
            method: 'POST',
            url: 'https://api.scorer.gitcoin.co/registry/submit-passport',
            headers: { 'X-API-KEY': GITCOIN_API_KEY },
            data: {
                address,
                scorer_id: scorerId,
            },
        });
    }

    static async getScoreUniqueHumanity(scorerId: number, address: string) {
        try {
            await this.submitPassport(scorerId, address);

            const { data } = await axios({
                method: 'GET',
                url: `https://api.scorer.gitcoin.co/registry/score/${scorerId}/${address}`,
                headers: { 'X-API-KEY': GITCOIN_API_KEY },
            });
            return { score: data.score === '0E-9' ? 0 : data.score };
        } catch (error) {
            logger.error(error.message);
            return { error: `Could not get a score for ${address}.` };
        }
    }
}
