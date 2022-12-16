import request, { Response } from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/api/types/enums';
import { dashboardAccessToken } from '@thxnetwork/api/util/jest/constants';
import { Contract } from 'web3-eth-contract';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { getContract } from '@thxnetwork/api/config/contracts';
import { WidgetDocument } from '@thxnetwork/api/models/Widget';

const user = request.agent(app);

describe('Widgets', () => {
    let poolId: string, testToken: Contract, widget: WidgetDocument;
    const color = '#FF0000',
        bgColor = '#0000FF',
        theme = 'light',
        newColor = '#00FF00',
        newBgColor = '#0F0F0F',
        newTheme = 'dark';

    beforeAll(async () => {
        await beforeAllCallback();
        testToken = getContract(ChainId.Hardhat, 'LimitedSupplyToken');
    });

    afterAll(afterAllCallback);

    it('POST /pools', (done) => {
        user.post('/v1/pools')
            .set({ Authorization: dashboardAccessToken })
            .send({
                chainId: ChainId.Hardhat,
                erc20tokens: [testToken.options.address],
            })
            .expect(({ body }: Response) => {
                poolId = body._id;
            })
            .expect(201, done);
    });

    it('POST /widgets/', (done) => {
        user.post('/v1/widgets/')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                color,
                bgColor,
                theme,
            })
            .expect(({ body }: Response) => {
                expect(body.uuid).toBeDefined();
                expect(body.color).toEqual(color);
                expect(body.bgColor).toEqual(bgColor);
                expect(body.theme).toEqual(theme);

                widget = body;
            })
            .expect(201, done);
    });

    it('GET /widgets', (done) => {
        user.get('/v1/widgets')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(({ body }: Response) => {
                expect(body[0].uuid).toBeDefined();
                expect(body[0].color).toEqual(color);
                expect(body[0].bgColor).toEqual(bgColor);
                expect(body[0].theme).toEqual(theme);
            })
            .expect(200, done);
    });

    it('PATCH /widgets/:uuid', (done) => {
        user.patch('/v1/widgets/' + widget.uuid)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                color: newColor,
                bgColor: newBgColor,
                theme: newTheme,
            })
            .expect(({ body }: Response) => {
                expect(body.uuid).toBeDefined();
                expect(body.color).toEqual(newColor);
                expect(body.bgColor).toEqual(newBgColor);
                expect(body.theme).toEqual(newTheme);
            })
            .expect(200, done);
    });

    it('GET /widgets/:uuid', (done) => {
        user.get('/v1/widgets/' + widget.uuid)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(({ body }: Response) => {
                expect(body.uuid).toBeDefined();
                expect(body.color).toEqual(newColor);
                expect(body.bgColor).toEqual(newBgColor);
                expect(body.theme).toEqual(newTheme);
            })
            .expect(200, done);
    });
});
