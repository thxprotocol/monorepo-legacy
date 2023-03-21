import { IAccount } from '../models/Account';
import { AssetPool } from '../models/AssetPool';
import AccountProxy from '../proxies/AccountProxy';
import MailService from '../services/MailService';
import * as AnalyticsService from '../services/AnalyticsService';

export async function createPoolAnalyticsReport() {
    // set date range
    const oneDay = 86400000; // one day in milliseconds
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date(new Date(endDate).getTime() - oneDay * 7);
    const dateRange = { startDate, endDate };

    let account: IAccount;
    for await (const pool of AssetPool.find({ sub: { $ne: null } })) {
        if (!account || account.sub != pool.sub) {
            account = await AccountProxy.getById(pool.sub);
            if (!account.email) {
                continue;
            }
        }

        const metrics = await AnalyticsService.getPoolMetrics(pool, dateRange);
        const leaderBoard = await AnalyticsService.getLeaderboard(pool, dateRange);

        let html = `<p>Here the weekly report for your pool &quot;<span style="font-size:16px"><strong>${pool.title}</strong></span>&quot;<br />
        &nbsp;</p>
        
        <hr />
        <p><span style="font-size:16px"><strong>REWARDS</strong></span><br />
        <br />
        <strong>Daily:</strong><br />
        total: <strong>${metrics.dailyRewards.total}</strong>,<br />
        claimed: <strong>${metrics.dailyRewards.totalClaimPoints}</strong></p>
        
        <p><strong>Referrals:</strong><br />
        total: <strong>${metrics.referralRewards.total}</strong>,<br />
        claimed: <strong>${metrics.referralRewards.totalClaimPoints}</strong></p>
        
        <p><strong>Conditionals:</strong><br />
        total: <strong>${metrics.pointRewards.total}</strong>,<br />
        claimed: <strong>${metrics.pointRewards.totalClaimPoints}</strong></p>
        
        <p><strong>Milestones:</strong><br />
        total: <strong>${metrics.milestoneRewards.total}</strong>,<br />
        claimed: <strong>${metrics.milestoneRewards.totalClaimPoints}</strong></p>
        &nbsp;</p>
        
        <hr />
        <p><span style="font-size:16px"><strong>PERKS</strong></span></p>
        
        <p><strong>Coin Perks:</strong><br />
        total: <strong>${metrics.erc20Perks.total}</strong>,<br />
        claimed: <strong>${metrics.erc20Perks.totalAmount}</strong></p>
        
        <p><strong>NFT Perks:</strong><br />
        total: <strong>${metrics.erc721Perks.total}</strong>,<br />
        claimed: <strong>${metrics.erc721Perks.totalAmount}</strong></p>
        
        <hr />
        <p><strong><span style="font-size:16px">LEADERBOARD</span></strong></p>`;

        html += leaderBoard.map((x) => {
            return `<p><span style="font-size:12px">${x.account.email}<br />
            ${x.account.address} - </span><span style="font-size:16px"><strong>${x.score}</strong></span></p>`;
        });

        await MailService.send(account.email, `Your weekly report for pool "${pool.title}"`, html);
    }
}
