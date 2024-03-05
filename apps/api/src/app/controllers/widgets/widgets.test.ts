import request, { Response } from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/common/enums';
import { dashboardAccessToken } from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { WidgetDocument } from '@thxnetwork/api/models/Widget';

const user = request.agent(app);

describe('Widgets', () => {
    let poolId: string, widget: WidgetDocument;
    const newTheme =
            '{"elements":{"btnBg":{"label":"Button","color":"#FF0000"},"btnText":{"label":"Button Text","color":"#000000"},"text":{"label":"Text","color":"#ffffff"},"bodyBg":{"label":"Background","color":"#000000"},"cardBg":{"label":"Card","color":"#3b3b3b"},"navbarBg":{"label":"Navigation","color":"#3b3b3b"},"launcherBg":{"label":"Launcher","color":"#ffffff"},"launcherIcon":{"label":"Launcher Icon","color":"#000000"}},"colors":{"success":{"label":"Success","color":"#28a745"},"warning":{"label":"Warning","color":"#ffe500"},"danger":{"label":"Danger","color":"#dc3545"},"info":{"label":"Info","color":"#17a2b8"}}}',
        align = 'left',
        message = 'New message',
        iconImg = 'https://image.icon';

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    it('POST /pools', (done) => {
        user.post('/v1/pools')
            .set({ Authorization: dashboardAccessToken })
            .send({ chainId: ChainId.Hardhat })
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
                expect(body[0].message).toEqual('Hi there!👋 Click me to complete quests and earn rewards...');
                widget = body[0];
            })
            .expect(200, done);
    });

    it('PATCH /widgets/:uuid', (done) => {
        user.patch('/v1/widgets/' + widget.uuid)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                iconImg,
                align,
                message,
                theme: newTheme,
            })
            .expect(({ body }: Response) => {
                expect(body.iconImg).toBe(iconImg);
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
                expect(body.iconImg).toBe(iconImg);
                expect(body.uuid).toBeDefined();
                expect(body.theme).toEqual(newTheme);
                expect(body.message).toEqual(message);
            })
            .expect(200, done);
    });
});
