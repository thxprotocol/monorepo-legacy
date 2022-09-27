import newrelic from 'newrelic';

export const wrapBackgroundTransaction = (name: string, group: string, promise: Promise<unknown>): Promise<unknown> => {
    return newrelic.startBackgroundTransaction(name, group, async () => {
        try {
            return await promise;
        } catch (error) {
            newrelic.noticeError(error);
            throw error;
        }
    });
};
