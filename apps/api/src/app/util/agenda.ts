import db from './database';
import { Agenda } from 'agenda';
import { logger } from './logger';
import { updatePendingTransactions } from '@thxnetwork/api/jobs/updatePendingTransactions';
import { createConditionalRewards } from '../jobs/createConditionalRewards';

const agenda = new Agenda({
    name: 'jobs',
    maxConcurrency: 1,
    lockLimit: 1,
    processEvery: '1 second',
});

const EVENT_UPDATE_PENDING_TRANSACTIONS = 'updatePendingTransactions';
const EVENT_CREATE_CONDITIONAL_REWARDS = 'createConditionalRewards';

agenda.define(EVENT_UPDATE_PENDING_TRANSACTIONS, updatePendingTransactions);
agenda.define(EVENT_CREATE_CONDITIONAL_REWARDS, createConditionalRewards);

db.connection.once('open', async () => {
    agenda.mongo(db.connection.getClient().db() as any, 'jobs');

    await agenda.start();
    await agenda.every('10 seconds', EVENT_UPDATE_PENDING_TRANSACTIONS);
    await agenda.every('15 minutes', EVENT_CREATE_CONDITIONAL_REWARDS);

    logger.info('AgendaJS successfully started job processor');
});

export { agenda, EVENT_UPDATE_PENDING_TRANSACTIONS };
