import db from './database';
import { Agenda } from 'agenda';
import { logger } from './logger';
// import { jobProcessTransactions } from '@thxnetwork/api/jobs/transactionProcessor';
import { generateRewardQRCodesJob } from '@thxnetwork/api/jobs/rewardQRcodesJob';

const agenda = new Agenda({
    name: 'jobs',
    maxConcurrency: 1,
    lockLimit: 1,
    processEvery: '1 second',
});

const EVENT_REQUIRE_TRANSACTIONS = 'requireTransactions';
const EVENT_SEND_DOWNLOAD_QR_EMAIL = 'sendDownloadQrEmail';

// agenda.define(EVENT_REQUIRE_TRANSACTIONS, jobProcessTransactions);
agenda.define(EVENT_SEND_DOWNLOAD_QR_EMAIL, generateRewardQRCodesJob);

db.connection.once('open', async () => {
    (agenda.mongo as any)(db.connection.getClient().db() as any, 'jobs');

    await agenda.start();

    // agenda.every('5 seconds', EVENT_REQUIRE_TRANSACTIONS);
    agenda.every('5 seconds', EVENT_SEND_DOWNLOAD_QR_EMAIL);

    logger.info('AgendaJS successfully started job processor');
});

export { agenda, EVENT_REQUIRE_TRANSACTIONS, EVENT_SEND_DOWNLOAD_QR_EMAIL };
