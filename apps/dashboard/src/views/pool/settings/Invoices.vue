<template>
    <div>
        <b-form-row>
            <b-col md="4">
                <strong>Invoices</strong>
                <p class="text-muted">Invoice data is updated every 5 minutes.</p>
            </b-col>
            <b-col md="8">
                <BTable :items="invoices" hover show-empty responsive="lg">
                    <!-- Head formatting -->
                    <template #head(period)> Invoice Period </template>
                    <template #head(plan)> Plan </template>
                    <template #head(costPlan)> Plan </template>
                    <template #head(costAdditional)> Additional MAP </template>
                    <template #head(costTotal)> Total Costs </template>

                    <!-- Cell formatting -->
                    <template #cell(plan)="{ item }">
                        <b-badge variant="primary" class="p-2">{{ AccountPlanType[item.plan] }}</b-badge>
                    </template>
                    <template #cell(costTotal)="{ item }">
                        <code> {{ toFiatPrice(item.costTotal) }}</code>
                    </template>
                    <template #cell(period)="{ item }"> {{ item.period.start }} - {{ item.period.end }} </template>
                    <template #cell(costPlan)="{ item }"> {{ toFiatPrice(item.costPlan) }} </template>
                    <template #cell(costAdditional)="{ item }"> {{ toFiatPrice(item.costAdditional) }} </template>
                </BTable>
            </b-col>
        </b-form-row>
        <hr />
    </div>
</template>

<script lang="ts">
import { TInvoiceState } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { AccountPlanType } from '@thxnetwork/common/enums';
import { toFiatPrice } from '@thxnetwork/dashboard/utils/price';

@Component({
    computed: mapGetters({
        poolList: 'pools/all',
        invoiceList: 'pools/invoices',
    }),
})
export default class WidgetsView extends Vue {
    AccountPlanType = AccountPlanType;
    toFiatPrice = toFiatPrice;

    poolList!: IPools;
    invoices!: TInvoiceState;

    get pool() {
        return this.poolList[this.$route.params.id];
    }

    get invoices() {
        if (!this.invoiceList[this.$route.params.id]) return [];

        return this.invoiceList[this.$route.params.id].map((invoice: TInvoice) => ({
            plan: invoice.plan,
            period: {
                start: new Date(invoice.periodStartDate).toLocaleDateString(),
                end: new Date(invoice.periodEndDate).toLocaleDateString(),
            },
            costPlan: invoice.costSubscription / 100,
            costAdditional: (invoice.additionalUnitCount * invoice.costPerUnit) / 100,
            costTotal: invoice.costTotal / 100,
        }));
    }

    mounted() {
        debugger;
        this.getInvoices();
    }

    async getInvoices() {
        this.isLoading = true;
        await this.$store.dispatch('pools/listInvoices', { pool: this.pool });
        this.isLoading = false;
    }
}
</script>
