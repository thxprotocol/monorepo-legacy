<template>
    <div class="container-md">
        <h2 class="my-3">Invoices</h2>
        <b-card class="shadow-sm mb-5" header-class="p-0">
            <b-form-row>
                <b-col md="4">
                    <strong>Invoices</strong>
                    <p class="text-muted">Invoice data is updated every 15 minutes.</p>
                </b-col>
                <b-col md="8">
                    <BTable class="table-invoices" :items="invoices" hover show-empty responsive="lg">
                        <!-- Head formatting -->
                        <template #head(plan)> Pricing Plan </template>
                        <template #head(period)> Invoice Period </template>
                        <template #head(costPlan)> Plan </template>
                        <template #head(map)>
                            MAP
                            <i
                                class="fas fa-info-circle"
                                v-b-tooltip
                                title="Monthly Active Participants represent the unique number of campaign participants who create at least one quest entry during the campaign's invoice period."
                            />
                        </template>
                        <template #head(costAdditional)> Additional </template>
                        <template #head(costTotal)> Total Costs </template>

                        <!-- Cell formatting -->
                        <template #cell(plan)="{ item }">
                            <b-badge variant="primary" class="p-2">{{ AccountPlanType[item.plan] }}</b-badge>
                        </template>
                        <template #cell(period)="{ item }">
                            <span class="text-muted">{{ item.period.start }} - {{ item.period.end }} </span>
                        </template>
                        <template #cell(map)="{ item }"> {{ item.map.count }}/{{ item.map.limit }} </template>
                        <template #cell(costPlan)="{ item }"> {{ toFiatPrice(item.costPlan) }} </template>
                        <template #cell(costAdditional)="{ item }"> {{ toFiatPrice(item.costAdditional) }} </template>
                        <template #cell(costTotal)="{ item }">
                            <code> {{ toFiatPrice(item.costTotal) }}</code>
                        </template>
                    </BTable>
                </b-col>
            </b-form-row>
        </b-card>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { AccountPlanType } from '@thxnetwork/common/enums';
import { toFiatPrice } from '@thxnetwork/dashboard/utils/price';
import { TInvoiceState } from '../store/modules/account';

@Component({
    computed: mapGetters({
        poolList: 'pools/all',
        invoiceList: 'account/invoices',
    }),
})
export default class WidgetsView extends Vue {
    AccountPlanType = AccountPlanType;
    toFiatPrice = toFiatPrice;
    isLoading = false;

    poolList!: IPools;
    invoiceList!: TInvoiceState;

    get invoices() {
        return this.invoiceList.map((invoice: TInvoice) => ({
            plan: invoice.plan,
            period: {
                start: new Date(invoice.periodStartDate).toLocaleDateString(),
                end: new Date(invoice.periodEndDate).toLocaleDateString(),
            },
            map: {
                count: invoice.mapCount,
                limit: invoice.mapLimit,
            },
            costPlan: invoice.costSubscription / 100,
            costAdditional: (invoice.additionalUnitCount * invoice.costPerUnit) / 100,
            costTotal: invoice.costTotal / 100,
        }));
    }

    async mounted() {
        await this.$store.dispatch('account/get');
        this.getInvoices();
    }

    async getInvoices() {
        this.isLoading = true;
        await this.$store.dispatch('account/listInvoices');
        this.isLoading = false;
    }
}
</script>
<style lang="scss">
.table-invoices {
    tr th:nth-child(3),
    tr th:nth-child(4),
    tr th:nth-child(5) {
        width: 140px;
        text-align: right;
    }
    tr td:nth-child(3),
    tr td:nth-child(4),
    tr td:nth-child(5) {
        text-align: right;
    }
}
</style>
