import db from './database';
import { Agenda, Job } from '@hokify/agenda';
import { updatePendingTransactions } from '@thxnetwork/api/jobs/updatePendingTransactions';
import { sendPoolAnalyticsReport } from '@thxnetwork/api/jobs/sendPoolAnalyticsReport';
import { updateCampaignRanks } from '@thxnetwork/api/jobs/updateCampaignRanks';
import { updateParticipantRanks } from '@thxnetwork/api/jobs/updateParticipantRanks';
import { logger } from './logger';
import { MONGODB_URI } from '../config/secrets';
import { JobType } from '@thxnetwork/common/enums';
import SafeService from '@thxnetwork/api/services/SafeService';
import WebhookService from '../services/WebhookService';
import QuestService from '../services/QuestService';
import TwitterCacheService from '../services/TwitterCacheService';
import InvoiceService from '../services/InvoiceService';
import BalancerService from '../services/BalancerService';
import RewardService from '../services/RewardService';
import PaymentService from '../services/PaymentService';
import TwitterQueryService from '../services/TwitterQueryService';

const agenda = new Agenda({
    db: {
        address: MONGODB_URI,
        collection: 'jobs',
    },
    maxConcurrency: 1,
    lockLimit: 1,
    processEvery: '1 second',
});

agenda.define(JobType.UpdateCampaignRanks, updateCampaignRanks);
agenda.define(JobType.UpdateParticipantRanks, updateParticipantRanks);
agenda.define(JobType.UpdatePendingTransactions, updatePendingTransactions);
agenda.define(JobType.CreateTwitterQuests, () => TwitterQueryService.searchJob());
agenda.define(JobType.CreateQuestEntry, (job: Job) => QuestService.createEntryJob(job));
agenda.define(JobType.CreateRewardPayment, (job: Job) => RewardService.createPaymentJob(job));
agenda.define(JobType.DeploySafe, (job: Job) => SafeService.createJob(job));
agenda.define(JobType.SendCampaignReport, sendPoolAnalyticsReport);
agenda.define(JobType.RequestAttemp, (job: Job) => WebhookService.requestAttemptJob(job));
agenda.define(JobType.UpdateTwitterLikeCache, (job: Job) => TwitterCacheService.updateLikeCacheJob(job));
agenda.define(JobType.UpdateTwitterRepostCache, (job: Job) => TwitterCacheService.updateRepostCacheJob(job));
agenda.define(JobType.UpsertInvoices, () => InvoiceService.upsertJob());
agenda.define(JobType.UpdatePrices, () => BalancerService.updatePricesJob());
agenda.define(JobType.UpdateAPR, () => BalancerService.updateMetricsJob());
agenda.define(JobType.AssertPayments, () => PaymentService.assertPaymentsJob());

db.connection.once('open', async () => {
    await agenda.start();

    await agenda.every('10 seconds', JobType.UpdatePrices);
    await agenda.every('10 seconds', JobType.UpdatePendingTransactions);
    await agenda.every('5 minutes', JobType.UpdateCampaignRanks);
    await agenda.every('15 minutes', JobType.UpsertInvoices);
    await agenda.every('15 minutes', JobType.UpdateAPR);
    await agenda.every('1 day', JobType.CreateTwitterQuests);
    await agenda.every('1 day', JobType.AssertPayments);
    await agenda.every('0 9 * * MON', JobType.SendCampaignReport);

    logger.info('AgendaJS started job processor');
});

export { agenda, JobType };
