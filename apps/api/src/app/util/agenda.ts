import db from './database';
import { Agenda } from 'agenda';
import { logger } from './logger';
import { updatePendingTransactions } from '@thxnetwork/api/jobs/updatePendingTransactions';
import { checkWaletFunds } from '@thxnetwork/api/jobs/walletReminder';

const agenda = new Agenda({
    name: 'jobs',
    maxConcurrency: 1,
    lockLimit: 1,
    processEvery: '1 second',
});

const EVENT_UPDATE_PENDING_TRANSACTIONS = 'updatePendingTransactions';
const EVENT_WALLET_MIGRATION_REMINDER = 'checkWaletFunds';

agenda.define(EVENT_UPDATE_PENDING_TRANSACTIONS, updatePendingTransactions);
agenda.define(EVENT_WALLET_MIGRATION_REMINDER, checkWaletFunds);

db.connection.once('open', async () => {
    agenda.mongo(db.connection.getClient().db() as any, 'jobs');

    await agenda.start();

    agenda.every('30 seconds', EVENT_UPDATE_PENDING_TRANSACTIONS);
    agenda.every('0 0 * * 1', EVENT_WALLET_MIGRATION_REMINDER); // At 00:00 on Monday

    logger.info('AgendaJS successfully started job processor');
});

export { agenda, EVENT_UPDATE_PENDING_TRANSACTIONS };
