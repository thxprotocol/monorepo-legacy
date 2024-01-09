import axios from 'axios';
import { GITCOIN_API_KEY } from '../config/secrets';
import { logger } from '../util/logger';

const GITCOIN_SCORER_ID = 6298;

async function getScoreUniqueHumanity(address: string) {
    try {
        const response = await axios({
            url: `https://api.scorer.gitcoin.co/registry/score/${GITCOIN_SCORER_ID}/${address}`,
            headers: { 'X-API-KEY': GITCOIN_API_KEY },
        });
        return response.data.score;
    } catch (error) {
        logger.error(error);
    }
}

export default { getScoreUniqueHumanity };
