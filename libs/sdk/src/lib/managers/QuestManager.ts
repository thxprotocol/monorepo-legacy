import { THXBrowserClient, THXIdentityClient } from '../clients';
import BaseManager from './BaseManager';

export async function poll<T>(fn: () => Promise<T>, fnCondition: (result: T) => boolean, ms: number, retries = 10) {
    let result = await fn();
    let attempt = 0;
    while (fnCondition(result)) {
        await wait(ms);
        result = await fn();
        if (attempt >= retries) break;
        attempt++;
    }
    return result;
}

function wait(ms = 1000) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

class QuestManager extends BaseManager {
    constructor(client: THXIdentityClient | THXBrowserClient) {
        super(client);
    }

    async list(poolId?: string) {
        return await this.client.request.get(`/v1/quests`, { poolId });
    }

    daily = {
        entry: {
            create: async (id: string) => {
                return await this.createEntry(`/v1/quests/daily/${id}/entries`);
            },
        },
    };

    invite = {
        entry: {
            create: async (id: string, payload: { sub: string }) => {
                return await this.client.request.post(`/v1/quests/invite/${id}/entries`, {
                    data: JSON.stringify(payload),
                });
            },
        },
    };

    social = {
        entry: {
            create: async (id: string) => {
                return await this.client.request.post(`/v1/quests/social/${id}/entries`);
            },
        },
    };

    custom = {
        entry: {
            create: async (id: string) => {
                return await this.client.request.post(`/v1/quests/custom/${id}/entries`);
            },
        },
    };

    web3 = {
        entry: {
            create: async (id: string, payload: { signature: string; message: string }) => {
                return await this.client.request.post(`/v1/quests/web3/${id}/entries`, {
                    data: JSON.stringify(payload),
                });
            },
        },
    };

    gitcoin = {
        entry: {
            create: async (id: string, payload: { signature: string; message: string }) => {
                return await this.client.request.post(`/v1/quests/gitcoin/${id}/entries`, {
                    data: JSON.stringify(payload),
                });
            },
        },
    };

    private async createEntry(path: string, payload = { data: {} }) {
        const recaptcha = await this.client.recaptcha.getToken(`QUEST_DAILY_ENTRY_CREATE`);

        // Schedule quest entry create job
        const { jobId, error } = await this.client.request.post(path, {
            ...payload,
            data: {
                ...payload.data,
                recaptcha,
            },
        });
        if (error) throw new Error(error);

        // wait for job to complete
        await this.waitForJob(jobId);
    }

    waitForJob = async (jobId: string) => {
        try {
            await poll(
                async () => await this.client.request.get(`/v1/jobs/${jobId}`),
                // Continue polling as long as lastFinishedAt is not set
                (job: any) => job && !job.lastFinishedAt,
                1000,
            );
        } catch (error) {
            console.error(error);
            throw new Error('Quest entry timed out.');
        }
    };
}

export default QuestManager;
