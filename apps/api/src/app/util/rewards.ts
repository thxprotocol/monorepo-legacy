import ClaimService from '@thxnetwork/api/services/ClaimService';
import RewardNFTService from '@thxnetwork/api/services/RewardNFTService';
import { RewardCoin, RewardNFT } from '@thxnetwork/api/models';

export async function findRewardByUuid(uuid: string) {
    const erc20Perk = await RewardCoin.findOne({ uuid });
    const erc721Perk = await RewardNFT.findOne({ uuid });
    return erc20Perk || erc721Perk;
}

export function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
}

export function subMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() - minutes * 60000);
}

export function formatDate(date: Date) {
    const yyyy = date.getFullYear();
    let mm: any = date.getMonth() + 1; // Months start at 0!
    let dd: any = date.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    return yyyy + '-' + mm + '-' + dd;
}

export const createRewardNFT = async (config: TRewardNFT) => {
    const service = new RewardNFTService();
    const perk = await service.create(config);
    const claims = await ClaimService.create(
        {
            poolId: config.poolId,
            rewardUuid: perk.uuid,
            erc721Id: config.erc721Id ? config.erc721Id : undefined,
            erc1155Id: config.erc1155Id ? config.erc1155Id : undefined,
        },
        config.claimAmount,
    );
    return { perk, claims };
};
