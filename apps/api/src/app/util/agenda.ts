import db from './database';
import { Agenda } from 'agenda';
import { logger } from './logger';
import { updatePendingTransactions } from '@thxnetwork/api/jobs/updatePendingTransactions';
import { createConditionalRewards } from '@thxnetwork/api/jobs/createConditionalRewards';
import { sendPoolAnalyticsReport } from '@thxnetwork/api/jobs/sendPoolAnalyticsReport';
import SafeService from '@thxnetwork/api/services/SafeService';

const agenda = new Agenda({
    name: 'jobs',
    maxConcurrency: 1,
    lockLimit: 1,
    processEvery: '1 second',
});

enum JobType {
    UpdatePendingTransactions = 'updatePendingTransactions',
    CreateConditionalRewards = 'createConditionalRewards',
    SendCampaignReport = 'sendPoolAnalyticsReport',
    MigrateWallets = 'migrateWallets',
    DeploySafe = 'deploySafe',
}

agenda.define(JobType.UpdatePendingTransactions, updatePendingTransactions);
agenda.define(JobType.CreateConditionalRewards, createConditionalRewards);
agenda.define(JobType.SendCampaignReport, sendPoolAnalyticsReport);

db.connection.on('open', async () => {
    agenda.mongo(db.connection.getClient().db() as any, 'jobs');

    agenda.define(JobType.DeploySafe, SafeService.createJob);
    agenda.define(JobType.MigrateWallets, SafeService.migrateJob);

    await agenda.start();

    await agenda.every('10 seconds', JobType.UpdatePendingTransactions);
    await agenda.every('15 minutes', JobType.CreateConditionalRewards);
    await agenda.every('0 9 * * MON', JobType.SendCampaignReport);

    logger.info('AgendaJS started job processor');
});

db.connection.on('disconnecting', async () => {
    await agenda.stop();
    await agenda.close();

    logger.info('AgendaJS stopped and closed job processor');
});

export { agenda, JobType };
