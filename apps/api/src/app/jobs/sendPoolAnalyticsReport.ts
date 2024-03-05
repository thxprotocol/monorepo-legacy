import { Pool } from '@thxnetwork/api/models';
import { DASHBOARD_URL } from '../config/secrets';
import { logger } from '../util/logger';
import PoolService from '../services/PoolService';
import AccountProxy from '../proxies/AccountProxy';
import MailService from '../services/MailService';
import AnalyticsService from '../services/AnalyticsService';

const emojiMap = ['🥇', '🥈', '🥉'];
const oneDay = 86400000; // one day in milliseconds

export async function sendPoolAnalyticsReport() {
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);

    const startDate = new Date(new Date(endDate).getTime() - oneDay * 7);
    const dateRange = { startDate, endDate };

    let account: TAccount;

    for await (const pool of Pool.find({ 'settings.isWeeklyDigestEnabled': true })) {
        try {
            if (!account || account.sub != pool.sub) account = await AccountProxy.findById(pool.sub);
            if (!account.email) continue;

            const { dailyQuest, inviteQuest, socialQuest, customQuest, coinReward, nftReward } =
                await AnalyticsService.getPoolMetrics(pool, dateRange);
            const leaderboard = await PoolService.findParticipants(pool, 1, 10);
            const subs = leaderboard.results.map((entry) => entry.sub);
            const accounts = await AccountProxy.find({ subs });

            const totalPointsClaimed =
                dailyQuest.totalAmount + inviteQuest.totalAmount + socialQuest.totalAmount + customQuest.totalAmount;
            const totalPointsSpent = coinReward.totalAmount + nftReward.totalAmount;

            // Skip if nothing happened.
            if (!totalPointsClaimed && !totalPointsSpent) continue;

            let html = `<p style="font-size: 18px">Hi there!👋</p>`;
            html += `<p>We're pleased to bring you the <strong>Weekly Digest</strong> for "${pool.settings.title}".</p>`;
            html += `<hr />`;

            html += `<p><strong>🏆 Quests: </strong> ${totalPointsClaimed} points claimed</p>`;
            html += `<table width="100%" role="presentation" border="0" cellpadding="0" cellspacing="0">`;
            if (dailyQuest.totalCreated) {
                html += `<tr>
                <td><strong>${dailyQuest.totalCreated}x</strong> Daily - ${dailyQuest.totalAmount} pts</td>
                <td align="right"><a href="${DASHBOARD_URL}/pool/${pool._id}/quests">Manage</a></td>
                `;
            }
            if (inviteQuest.totalCreated) {
                html += `<tr>
                <td><strong>${inviteQuest.totalCreated}x</strong> Invite - ${inviteQuest.totalAmount} pts)</td>
                <td align="right"><a href="${DASHBOARD_URL}/pool/${pool._id}/quests">Manage</a></td>
                </tr>`;
            }
            if (socialQuest.totalCreated) {
                html += `<tr>
                <td><strong>${socialQuest.totalCreated}x</strong> Social - ${socialQuest.totalAmount} pts</td>
                <td align="right"><a href="${DASHBOARD_URL}/pool/${pool._id}/quests">Manage</a></td>
                </tr>`;
            }
            if (customQuest.totalCreated) {
                html += `<tr>
                <td><strong>${customQuest.totalCreated}x</strong> Custom - ${customQuest.totalAmount} pts</td>
                <td align="right"><a href="${DASHBOARD_URL}/pool/${pool._id}/quests">Manage</a></td>
                </tr>`;
            }
            html += `</table>`;
            html += `<hr />`;

            html += `<p><strong>🎁 Rewards: </strong> ${totalPointsSpent} points spent</p>`;
            html += `<table width="100%" role="presentation" border="0" cellpadding="0" cellspacing="0">`;
            if (coinReward.totalCreated) {
                html += `<tr>
                <td><strong>${coinReward.totalCreated}x</strong> Coin Rewards (${coinReward.totalAmount} points)</td>
                <td align="right" ><a href="${DASHBOARD_URL}/pool/${pool._id}/rewards">Manage</a></td>
                </tr>`;
            }
            if (nftReward.totalCreated) {
                html += `<tr>
                <td><strong>${nftReward.totalCreated}x</strong> NFT Rewards (${nftReward.totalAmount} points)</td>
                <td align="right"><a href="${DASHBOARD_URL}/pool/${pool._id}/rewards">Manage</a></td>
                </tr>`;
            }
            html += `</table>`;
            html += `<hr />`;

            html += `<p style="font-size:16px"><strong>Top 3</strong></p>`;
            html += `<table role="presentation" border="0" cellpadding="0" cellspacing="0">`;

            for (const index in leaderboard.results) {
                const entry = leaderboard[index];
                const account = accounts.find((a) => a.sub === entry.sub);

                html += `<tr>
                <td width="5%">${emojiMap[index]}</td>
                <td><strong>${account.firstName || '...'}</strong> ${entry.wallet.address.substring(0, 8)}...</td>
                <td align="right" width="25%"><strong>${entry.score} Points</strong></td>
                </tr>`;
            }
            html += '</table>';
            html += `<a href="${DASHBOARD_URL}/pool/${pool._id}/participants">All participants</a>`;

            await MailService.send(account.email, `🎁 Weekly Digest: "${pool.settings.title}"`, html);
        } catch (error) {
            logger.error(error);
        }
    }
}
