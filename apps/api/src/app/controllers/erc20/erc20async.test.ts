import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, ERC20Type } from '@thxnetwork/api/types/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { isAddress } from 'ethers/lib/utils';
import { dashboardAccessToken as ACCESS_TOKEN } from '@thxnetwork/api/util/jest/constants';

const http = request.agent(app);

describe('ERC20async', () => {
    beforeAll(beforeAllCallback);

    afterAll(afterAllCallback);

    describe('POST /erc20', () => {
        const TOTAL_SUPPLY = 1000,
            name = 'Test Token',
            symbol = 'TTK';

        it('Able to create limited token and return address', (done) => {
            http.post('/v1/erc20')
                .set('Authorization', ACCESS_TOKEN)
                .field({
                    name,
                    symbol,
                    chainId: ChainId.Hardhat, //TODO: Switch to Polygon to actully make it async.
                    totalSupply: TOTAL_SUPPLY,
                    type: ERC20Type.Limited,
                })
                .expect(async ({ body }: request.Response) => {
                    expect(body._id).toBeDefined();
                    expect(isAddress(body.address)).toBe(true);
                })
                .expect(201, done);
        });
    });
});
