import request, { Response } from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/types/enums';
import { dashboardAccessToken } from '@thxnetwork/api/util/jest/constants';
import { Contract } from 'web3-eth-contract';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { getContract } from '@thxnetwork/api/config/contracts';
import { WidgetDocument } from '@thxnetwork/api/models/Widget';

const user = request.agent(app);

describe('Widgets', () => {
    let poolId: string, testToken: Contract, widget: WidgetDocument;
    const newTheme =
            '{"elements":{"btnBg":{"label":"Button","color":"#FF0000"},"btnText":{"label":"Button Text","color":"#000000"},"text":{"label":"Text","color":"#ffffff"},"bodyBg":{"label":"Background","color":"#000000"},"cardBg":{"label":"Card","color":"#3b3b3b"},"navbarBg":{"label":"Navigation","color":"#3b3b3b"},"launcherBg":{"label":"Launcher","color":"#ffffff"},"launcherIcon":{"label":"Launcher Icon","color":"#000000"}},"colors":{"success":{"label":"Success","color":"#28a745"},"warning":{"label":"Warning","color":"#ffe500"},"danger":{"label":"Danger","color":"#dc3545"},"info":{"label":"Info","color":"#17a2b8"}}}',
        align = 'left',
        message = 'New message';

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

    it('GET /widgets', (done) => {
        user.get('/v1/widgets')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(({ body }: Response) => {
                expect(body[0].uuid).toBeDefined();
                expect(body[0].theme).toBeDefined();
                expect(body[0].message).toEqual('Hi there!👋 Click me to earn rewards and collect crypto perks...');
                widget = body[0];
            })
            .expect(200, done);
    });

    it('PATCH /widgets/:uuid', (done) => {
        user.patch('/v1/widgets/' + widget.uuid)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                align,
                message,
                theme: newTheme,
            })
            .expect(({ body }: Response) => {
                expect(body.uuid).toBeDefined();
                expect(body.theme).toEqual(newTheme);
                expect(body.message).toEqual(message);
                expect(body.align).toEqual(align);
            })
            .expect(200, done);
    });

    it('GET /widgets/:uuid', (done) => {
        user.get('/v1/widgets/' + widget.uuid)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(({ body }: Response) => {
                expect(body.uuid).toBeDefined();
                expect(body.theme).toEqual(newTheme);
                expect(body.message).toEqual(message);
            })
            .expect(200, done);
    });
});
