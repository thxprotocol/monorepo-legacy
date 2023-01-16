import type { TPayment } from '@thxnetwork/wallet/types/Payments';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { thxClient } from '@thxnetwork/wallet/utils/oidc';

@Module({ namespaced: true })
class PaymentModule extends VuexModule {
    payment: TPayment | null = null;

    @Mutation
    set(payment: TPayment) {
        this.payment = payment;
    }

    @Action({ rawError: true })
    async read(payload: { accessToken: string; paymentId: string }) {
        const data = await thxClient.payments.read(payload);
        this.context.commit('set', data);
        return data;
    }

    @Action({ rawError: true })
    async pay() {
        if (!this.payment) return;

        const data = await thxClient.payments.pay({
            id: this.payment.id,
            poolId: this.payment.poolId,
            token: this.payment.token,
        });

        this.context.commit('set', data);
    }
}

export default PaymentModule;
