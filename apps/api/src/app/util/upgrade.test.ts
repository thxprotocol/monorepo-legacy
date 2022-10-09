import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/api/types/enums';

import { isAddress } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import { updateDiamondContract } from '@thxnetwork/api/util/upgrades';
import { getContract } from '@thxnetwork/api/config/contracts';
import { currentVersion } from '@thxnetwork/artifacts';
import { dashboardAccessToken } from './jest/constants';

const user = request.agent(app);

describe('Upgrades', () => {
    let poolId: string, testToken: Contract;

    beforeAll(async () => {
        await beforeAllCallback();

        testToken = getContract(ChainId.Hardhat, 'LimitedSupplyToken');

        await user
            .post('/v1/pools')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
                variant: 'defaultPool',
                erc20tokens: [testToken.options.address],
            })
            .expect((res: request.Response) => {
                expect(isAddress(res.body.address)).toBe(true);
                poolId = res.body._id;
            })
            .expect(201);
    });

    afterAll(afterAllCallback);

    describe('Test pool upgrades', () => {
        it('Switch between different diamond facet configurations', async () => {
            const pool = await AssetPoolService.getById(poolId);

            expect(await AssetPoolService.contractVersionVariant(pool)).toEqual({
                variant: 'defaultDiamond',
                version: currentVersion,
            });

            await updateDiamondContract(pool.chainId, pool.contract, 'registry');
            expect((await AssetPoolService.contractVersionVariant(pool)).variant).toBe('registry');

            await AssetPoolService.updateAssetPool(pool);
            expect(await AssetPoolService.contractVersionVariant(pool)).toEqual({
                variant: 'defaultDiamond',
                version: currentVersion,
            });
        });
    });
});
