import { IAccount } from '../models/Account';
import { AssetPool } from '../models/AssetPool';
import AccountProxy from '../proxies/AccountProxy';
import MailService from '../services/MailService';
import * as AnalyticsService from '../services/AnalyticsService';
import { DASHBOARD_URL } from '../config/secrets';

const emojiMap = ['🥇', '🥈', '🥉'];
const oneDay = 86400000; // one day in milliseconds

export async function createPoolAnalyticsReport() {
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);

    const startDate = new Date(new Date(endDate).getTime() - oneDay * 7);
    const dateRange = { startDate, endDate };

    let account: IAccount;
    for await (const pool of AssetPool.find({ 'settings.isWeeklyDigestEnabled': true })) {
        if (!account || account.sub != pool.sub) account = await AccountProxy.getById(pool.sub);
        if (!account.email) continue;

        const metrics = await AnalyticsService.getPoolMetrics(pool, dateRange);
        const leaderBoard = await AnalyticsService.getLeaderboard(pool);
        const totalPointsClaimed =
            metrics.dailyRewards.totalClaimPoints +
            metrics.referralRewards.totalClaimPoints +
            metrics.pointRewards.totalClaimPoints +
            metrics.milestoneRewards.totalClaimPoints;
        const totalPointsSpent = metrics.erc20Perks.totalAmount + metrics.erc721Perks.totalAmount;

        // Skip if nothing happened.
        if (!totalPointsClaimed && !totalPointsSpent) continue;

        let html = `<p style="font-size: 18px">Hi there!👋</p>`;
        html += `<p>We're pleased to bring you the <strong>Weekly Digest</strong> for "${pool.settings.title}".</p>`;
        html += `<hr />`;

        html += `<p><strong>🏆 Rewards: </strong> ${totalPointsClaimed} points claimed</p>`;
        html += `<table width="100%" role="presentation" border="0" cellpadding="0" cellspacing="0">`;
        if (metrics.dailyRewards.total) {
            html += `<tr>
            <td><strong>${metrics.dailyRewards.claims}x</strong> Daily - ${metrics.dailyRewards.totalClaimPoints} pts</td>
            <td align="right"><a href="${DASHBOARD_URL}/pool/${pool._id}/daily">Manage</a></td>
            `;
        }
        if (metrics.referralRewards.total) {
            html += `<tr>
            <td><strong>${metrics.referralRewards.claims}x</strong> Referral - ${metrics.referralRewards.totalClaimPoints} pts)</td>
            <td align="right"><a href="${DASHBOARD_URL}/pool/${pool._id}/referrals">Manage</a></td>
            </tr>`;
        }
        if (metrics.pointRewards.total) {
            html += `<tr>
            <td><strong>${metrics.pointRewards.claims}x</strong> Conditional - ${metrics.pointRewards.totalClaimPoints} pts</td>
            <td align="right"><a href="${DASHBOARD_URL}/pool/${pool._id}/conditionals">Manage</a></td>
            </tr>`;
        }
        if (metrics.milestoneRewards.total) {
            html += `<tr>
            <td><strong>${metrics.milestoneRewards.claims}x</strong> Milestone - ${metrics.milestoneRewards.totalClaimPoints} pts</td>
            <td align="right"><a href="${DASHBOARD_URL}/pool/${pool._id}/milestone-rewards">Manage</a></td>
            </tr>`;
        }
        html += `</table>`;
        html += `<hr />`;

        html += `<p><strong>🎁 Perks: </strong> ${totalPointsSpent} points spent</p>`;
        html += `<table width="100%" role="presentation" border="0" cellpadding="0" cellspacing="0">`;
        if (metrics.erc20Perks.total) {
            html += `<tr>
            <td><strong>${metrics.erc20Perks.payments}x</strong> Coin Perks (${metrics.erc20Perks.totalAmount} points)</td>
            <td align="right" ><a href="${DASHBOARD_URL}/pool/${pool._id}/erc20-perks">Manage</a></td>
            </tr>`;
        }
        if (metrics.erc721Perks.total) {
            html += `<tr>
            <td><strong>${metrics.erc721Perks.total}x</strong> NFT Perks (${metrics.erc721Perks.totalAmount} points)</td>
            <td align="right"><a href="${DASHBOARD_URL}/pool/${pool._id}/erc721-perks">Manage</a></td>
            </tr>`;
        }
        html += `</table>`;
        html += `<hr />`;

        html += `<p style="font-size:16px"><strong>Top 3</strong></p>`;
        html += `<table role="presentation" border="0" cellpadding="0" cellspacing="0">`;

        for (const index in leaderBoard) {
            const entry = leaderBoard[index];
            const address = await entry.account.getAddress(pool.chainId);
            html += `<tr>
            <td width="5%">${emojiMap[index]}</td>
            <td><strong>${entry.account.firstName || '...'}</strong> ${address.substring(0, 8)}...</td>
            <td align="right" width="25%"><strong>${entry.score} Points</strong></td>
            </tr>`;
        }
        html += '</table>';
        html += `<a href="${DASHBOARD_URL}/pool/${pool._id}/dashboard">Full leaderboard</a>`;

        await MailService.send(account.email, `🎁 Weekly Digest: "${pool.settings.title}"`, html);
    }
}
