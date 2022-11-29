import db from './database';
import { Agenda } from 'agenda';
import { logger } from './logger';
import { updatePendingTransactions } from '@thxnetwork/api/jobs/updatePendingTransactions';
import { generateMetadataRewardQRCodesJob } from '@thxnetwork/api/jobs/metadataRewardQRcodesJob';

const agenda = new Agenda({
    name: 'jobs',
    maxConcurrency: 1,
    lockLimit: 1,
    processEvery: '1 second',
});

const EVENT_UPDATE_PENDING_TRANSACTIONS = 'updatePendingTransactions';
const EVENT_SEND_DOWNLOAD_METADATA_QR_EMAIL = 'sendDownloadMetadataQrEmail';

agenda.define(EVENT_UPDATE_PENDING_TRANSACTIONS, updatePendingTransactions);
agenda.define(EVENT_SEND_DOWNLOAD_METADATA_QR_EMAIL, generateMetadataRewardQRCodesJob);

db.connection.once('open', async () => {
    agenda.mongo(db.connection.getClient().db() as any, 'jobs');

    await agenda.start();

    agenda.every('30 seconds', EVENT_UPDATE_PENDING_TRANSACTIONS);
    agenda.every('5 seconds', EVENT_SEND_DOWNLOAD_METADATA_QR_EMAIL);

    logger.info('AgendaJS successfully started job processor');
});

export { agenda, EVENT_UPDATE_PENDING_TRANSACTIONS, EVENT_SEND_DOWNLOAD_METADATA_QR_EMAIL };
