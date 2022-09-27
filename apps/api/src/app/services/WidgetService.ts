import { Widget } from '@thxnetwork/api/models/Widget';

export default class WidgetService {
    static get(clientId: string) {
        return Widget.findOne({ clientId });
    }

    static async getForUserByPool(sub: string, poolId: string) {
        const widgets = await Widget.find({ sub, 'metadata.poolId': poolId });
        return widgets.map((widget) => widget.clientId);
    }

    static async create(sub: string, clientId: string, rewardId: number, poolId: string) {
        return await Widget.create({
            sub,
            clientId,
            metadata: {
                rewardId,
                poolId,
            },
        });
    }

    static async remove(clientId: string) {
        await Widget.deleteOne({ clientId });
    }
}
